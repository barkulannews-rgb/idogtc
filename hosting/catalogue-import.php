<?php
declare(strict_types=1);
/* IDO_CATALOGUE_CONFIG */

// Pure merge: existing products, prices, photos, header and other settings are retained.
function mergeIdoCatalogue(array $state, array $catalogue): array {
    if (($catalogue['batch'] ?? '') !== 'idogtc-catalogue-2026-11' || count($catalogue['products'] ?? []) !== 246 || count($catalogue['categories'] ?? []) !== 18) throw new RuntimeException('Invalid catalogue manifest.');
    $codes = [];
    foreach ($catalogue['products'] as $product) {
        if (!is_string($product['sku'] ?? null) || !preg_match('/^(BM|PT)-\d{4}$/', $product['sku']) || isset($codes[$product['sku']])) throw new RuntimeException('Invalid or duplicate catalogue item code.');
        $codes[$product['sku']] = true;
    }
    $known = [];
    $nextId = 1;
    foreach ($state['products'] as $product) {
        $nextId = max($nextId, (int)$product['id'] + 1);
        if (!empty($product['sku'])) $known[strtoupper(trim($product['sku']))] = true;
    }
    $added = 0; $skipped = 0; $categoriesAdded = 0;
    foreach ($catalogue['products'] as $product) {
        if (isset($known[$product['sku']])) { $skipped++; continue; }
        $sourceCategory = null;
        foreach ($catalogue['categories'] as $category) if ($category['name'] === $product['category']) { $sourceCategory = $category; break; }
        if (!$sourceCategory) throw new RuntimeException('Catalogue category missing.');
        $destinationCategory = null;
        foreach ($state['categories'] as $category) {
            if ($category['id'] === $sourceCategory['id'] || strcasecmp($category['name'], $sourceCategory['name']) === 0) { $destinationCategory = $category; break; }
        }
        if (!$destinationCategory) {
            $destinationCategory = $sourceCategory;
            $state['categories'][] = $destinationCategory; $categoriesAdded++;
        }
        $product['category'] = $destinationCategory['name'];
        $product['id'] = $nextId++;
        $state['products'][] = $product;
        $known[$product['sku']] = true; $added++;
    }
    return ['state' => $state, 'added' => $added, 'skipped' => $skipped, 'categoriesAdded' => $categoriesAdded];
}

function updateIdoCatalogueImages(array $state, array $images, ?string $documentRoot = null): array {
    $documentRoot = $documentRoot ?? dirname(__DIR__);
    $updated = 0;
    foreach ($state['products'] as &$product) {
        $sku = $product['sku'] ?? '';
        if (!isset($images[$sku])) continue;
        $source = $product['image'] ?? '';
        // Keep actual product images and any owner-selected replacements intact.
        if (empty($product['imageIsIllustration']) || !preg_match('#^/images/catalogue/excel-(bm|pt)-\d+\.svg$#', $source)) continue;
        $image = $images[$sku];
        if (!is_string($image) || !preg_match('#^/images/products/(BM|PT)-\d{4}\.jpg$#', $image) || !is_file($documentRoot . $image)) throw new RuntimeException('Generated product image missing.');
        $product['image'] = $image;
        $product['imageIsIllustration'] = true;
        $updated++;
    }
    unset($product);
    return ['state' => $state, 'added' => 0, 'skipped' => 246, 'categoriesAdded' => 0, 'imagesUpdated' => $updated];
}

// Only the deployment runner installs this file, with a short-lived random token hash.
if (!defined('IDO_IMPORT_TOKEN_HASH')) return;
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || time() > IDO_IMPORT_EXPIRES || !hash_equals(IDO_IMPORT_TOKEN_HASH, hash('sha256', $_SERVER['HTTP_X_IDO_IMPORT_TOKEN'] ?? ''))) {
        http_response_code(403); echo json_encode(['error' => 'Import authorization expired or invalid.']); exit;
    }
    $home = dirname(__DIR__, 2);
    $config = require $home . '/idogtc-config.php';
    $db = new PDO('mysql:host=' . $config['db_host'] . ';port=' . (int)($config['db_port'] ?? 3306) . ';dbname=' . $config['db_name'] . ';charset=utf8mb4', $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    $catalogue = json_decode(base64_decode(IDO_CATALOGUE_DATA, true), true, 512, JSON_THROW_ON_ERROR);
    $db->beginTransaction();
    $row = $db->query('SELECT revision, payload FROM ido_store WHERE id = 1 FOR UPDATE')->fetch();
    if (!$row) throw new RuntimeException('The existing store was not found.');
    $state = json_decode($row['payload'], true, 512, JSON_THROW_ON_ERROR);
    $result = defined('IDO_CATALOGUE_IMAGE_DATA')
        ? updateIdoCatalogueImages($state, json_decode(base64_decode(IDO_CATALOGUE_IMAGE_DATA, true), true, 512, JSON_THROW_ON_ERROR))
        : mergeIdoCatalogue($state, $catalogue);
    $changed = $result['added'] > 0 || ($result['imagesUpdated'] ?? 0) > 0;
    $revision = (int)$row['revision'];
    if ($changed) {
        // A private pre-import snapshot is written outside public_html before the database changes.
        $directory = $home . '/idogtc-catalogue-backups';
        if (!is_dir($directory) && !mkdir($directory, 0700)) throw new RuntimeException('Cannot create private import backup.');
        $backup = $directory . '/before-catalogue-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.json';
        $previousMask = umask(0077);
        $file = fopen($backup, 'x');
        umask($previousMask);
        if (!$file) throw new RuntimeException('Cannot write private import backup.');
        $snapshot = json_encode(['revision' => $revision, 'state' => $state], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $written = fwrite($file, $snapshot); fclose($file);
        if ($written !== strlen($snapshot)) throw new RuntimeException('Import backup incomplete.');
        $revision++;
        $db->prepare('UPDATE ido_store SET payload = ?, revision = ? WHERE id = 1')->execute([json_encode($result['state'], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), $revision]);
    }
    $db->commit();
    echo json_encode(['added' => $result['added'], 'skipped' => $result['skipped'], 'categoriesAdded' => $result['categoriesAdded'], 'imagesUpdated' => $result['imagesUpdated'] ?? 0, 'revision' => $revision, 'backupCreated' => $changed, 'totalProducts' => count($result['state']['products'])]);
} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log('IDO catalogue import: ' . $error->getMessage());
    http_response_code(503); echo json_encode(['error' => 'Catalogue import failed. The existing store has been preserved. Check the server logs.']);
}
