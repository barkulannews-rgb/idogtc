<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $value, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($value, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
function fail(string $message, int $status = 400): void { respond(['error' => $message], $status); }
function admin(): void {
    if (empty($_SESSION['admin']) || ($_SESSION['expires'] ?? 0) < time()) fail('Please log in again.', 401);
}
function data(): array {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000000) fail('Upload is too large.', 413);
    try { $value = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR); }
    catch (Throwable $error) { fail('Invalid request JSON.'); }
    if (!is_array($value)) fail('Invalid request body.');
    return $value;
}
function encode(array $value): string { return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR); }
function stored(PDO $db, bool $lock = false): array {
    $row = $db->query('SELECT revision, payload FROM ido_store WHERE id = 1' . ($lock ? ' FOR UPDATE' : ''))->fetch();
    if (!$row) fail('Complete the one-time website setup first.', 503);
    return ['revision' => (int)$row['revision'], 'state' => json_decode($row['payload'], true, 512, JSON_THROW_ON_ERROR)];
}
function orders(PDO $db): array {
    return array_map(function ($row) { return json_decode($row['payload'], true, 512, JSON_THROW_ON_ERROR); }, $db->query('SELECT payload FROM ido_orders ORDER BY created_at DESC, id DESC')->fetchAll());
}
function limit(PDO $db, string $kind, int $maximum, int $seconds): void {
    // Database-backed, IP-based counters apply even if cookies are cleared.
    $bucket = hash('sha256', $kind . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $db->prepare('INSERT INTO ido_limits (bucket, attempts, expires_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE attempts = IF(expires_at < UNIX_TIMESTAMP(), 1, attempts + 1), expires_at = IF(expires_at < UNIX_TIMESTAMP(), VALUES(expires_at), expires_at)')->execute([$bucket, time() + $seconds]);
    $query = $db->prepare('SELECT attempts FROM ido_limits WHERE bucket = ?');
    $query->execute([$bucket]);
    if ((int)$query->fetchColumn() > $maximum) fail('Too many requests. Please try again later.', 429);
    $db->exec('DELETE FROM ido_limits WHERE expires_at < UNIX_TIMESTAMP()');
}
function textFields(array $record, array $fields): void {
    foreach ($fields as $field) if (!isset($record[$field]) || !is_string($record[$field]) || strlen($record[$field]) > 20000) fail('Invalid field: ' . $field);
}
function validateHeader(array $header): void {
    textFields($header, ['logoAlt','brandPrimary','brandSecondary','whatsappPhone','customerServicePhone']);
    if (!isset($header['image']) || !is_string($header['image'])) fail('Invalid header logo.');
    $text = function ($value): void {
        if (!is_array($value)) fail('Invalid header text.');
        foreach (['en','so'] as $language) if (!isset($value[$language]) || !is_string($value[$language]) || strlen($value[$language]) > 2000) fail('Invalid header translation.');
    };
    $text($header['tagline'] ?? null); $text($header['whatsappMessage'] ?? null);
    if (!isset($header['labels'], $header['visibility']) || !is_array($header['labels']) || !is_array($header['visibility'])) fail('Invalid header options.');
    foreach (['whatsappPhone','customerServicePhone'] as $field) {
        $phone = preg_replace('/\D/', '', $header[$field]);
        if ($header[$field] !== '' && (!preg_match('/^\+?[\d\s()-]+$/', $header[$field]) || strlen($phone) < 7 || strlen($phone) > 15)) fail('Use an international header phone number.');
    }
    foreach (['bosaso','dubai','customerService','search','categories','allCategories','whatsapp','wishlist','cart'] as $key) $text($header['labels'][$key] ?? null);
    foreach (['topBar','logo','brand','tagline','search','customerService','categories','whatsapp','currency','language','wishlist','cart'] as $key) if (!isset($header['visibility'][$key]) || !is_bool($header['visibility'][$key])) fail('Invalid header visibility.');
    foreach (['topLinks','navigation'] as $group) {
        $links = $header[$group] ?? null;
        if (!is_array($links) || array_values($links) !== $links || count($links) > 12) fail('Invalid header menu.');
        $ids = [];
        foreach ($links as $link) {
            if (!is_array($link)) fail('Invalid header link.');
            textFields($link, ['id','target']); $text($link['label'] ?? null);
            if ($link['id'] === '' || in_array($link['id'], $ids, true) || trim($link['label']['en']) === '' || !isset($link['visible']) || !is_bool($link['visible']) || !in_array($link['target'], ['top','categories','featured','recent','about','contact'], true)) fail('Invalid header link.');
            $ids[] = $link['id'];
        }
    }
}
function validateFooter(array $footer): void {
    $text = function ($value): void {
        if (!is_array($value)) fail('Invalid footer text.');
        foreach (['en','so'] as $language) if (!isset($value[$language]) || !is_string($value[$language]) || strlen($value[$language]) > 8000) fail('Invalid footer translation.');
    };
    $text($footer['description'] ?? null); $text($footer['copyright'] ?? null);
    foreach (['labels','visibility','social'] as $key) if (!isset($footer[$key]) || !is_array($footer[$key])) fail('Invalid footer options.');
    foreach (['contact','shop','account','newsletter','newsletterDescription','emailPlaceholder','subscribe','social','domain'] as $key) $text($footer['labels'][$key] ?? null);
    foreach (['enabled','contact','shop','account','newsletter','social','copyright','domain'] as $key) if (!isset($footer['visibility'][$key]) || !is_bool($footer['visibility'][$key])) fail('Invalid footer visibility.');
    foreach (['facebook','instagram','twitter','linkedin'] as $key) {
        $url = $footer['social'][$key] ?? null;
        if (!is_string($url) || strlen($url) > 2000) fail('Invalid social media URL.');
        if ($url !== '') {
            $parts = parse_url($url);
            if (!filter_var($url, FILTER_VALIDATE_URL) || !is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['user']) || isset($parts['pass'])) fail('Social media links must use https.');
        }
    }
    foreach (['shopLinks','accountLinks'] as $group) {
        $links = $footer[$group] ?? null;
        if (!is_array($links) || array_values($links) !== $links || count($links) > 12) fail('Invalid footer menu.');
        $ids = [];
        foreach ($links as $link) {
            if (!is_array($link)) fail('Invalid footer link.');
            textFields($link, ['id','target']); $text($link['label'] ?? null);
            $target = $link['target'];
            if ($link['id'] === '' || in_array($link['id'], $ids, true) || trim($link['label']['en']) === '' || !isset($link['visible']) || !is_bool($link['visible']) || (!in_array($target, ['top','categories','recent','about','contact','cart','wishlist'], true) && !(str_starts_with($target, 'category:') && strlen($target) > 9))) fail('Invalid footer link.');
            $ids[] = $link['id'];
        }
    }
}
function validateState(array $state): void {
    $definitions = [
        'products' => ['name','category','price','oldPrice','origin','specs'],
        'slides' => ['title','subtitle','badge','desc','offer'],
        'categories' => ['id','name','count'],
        'mediaItems' => ['id','title','date'],
        'promoBanners' => ['id','badge','title','description','buttonText','buttonLink'],
        'partners' => ['id','name','tag'],
    ];
    foreach ($definitions as $key => $fields) {
        if (!isset($state[$key]) || !is_array($state[$key]) || array_values($state[$key]) !== $state[$key] || count($state[$key]) > 2000) fail('Invalid collection: ' . $key);
        $ids = [];
        foreach ($state[$key] as $record) {
            if (!is_array($record)) fail('Invalid record.');
            textFields($record, $fields);
            foreach (['image','img','url'] as $image) if (isset($record[$image]) && !is_string($record[$image])) fail('Invalid image.');
            if (isset($record['id'])) {
                if (in_array((string)$record['id'], $ids, true)) fail('Duplicate record ID.');
                $ids[] = (string)$record['id'];
            }
        }
    }
    if (!isset($state['companySettings']) || !is_array($state['companySettings'])) fail('Invalid company settings.');
    textFields($state['companySettings'], ['name','shortName','domain','bosasoPhone','dubaiPhone','email','bosasoAddress','dubaiAddress','aboutText']);
    if (array_key_exists('header', $state['companySettings'])) {
        if (!is_array($state['companySettings']['header'])) fail('Invalid header settings.');
        validateHeader($state['companySettings']['header']);
    }
    if (array_key_exists('footer', $state['companySettings'])) {
        if (!is_array($state['companySettings']['footer'])) fail('Invalid footer settings.');
        validateFooter($state['companySettings']['footer']);
    }
    $names = [];
    foreach ($state['categories'] as $category) {
        $name = strtolower(trim($category['name']));
        if ($name === '' || in_array($name, $names, true)) fail('Category names must be unique.');
        $names[] = $name;
    }
    $productCodes = [];
    foreach ($state['products'] as $product) {
        if (!isset($product['id']) || !is_int($product['id']) || $product['id'] < 1 || !isset($product['numericPrice']) || !is_numeric($product['numericPrice']) || (float)$product['numericPrice'] < 0 || (float)$product['numericPrice'] > 1000000000) fail('Invalid product price or ID.');
        if (!in_array(strtolower($product['category']), $names, true)) fail('A product category does not exist.');
        foreach (['rating','reviews'] as $field) if (!isset($product[$field]) || !is_numeric($product[$field])) fail('Invalid product rating.');
        foreach (['priceOnRequest','imageIsIllustration'] as $field) if (isset($product[$field]) && !is_bool($product[$field])) fail('Invalid product option.');
        foreach (['sku','unit','catalogueGroup'] as $field) if (isset($product[$field]) && (!is_string($product[$field]) || strlen($product[$field]) > 200)) fail('Invalid product detail.');
        if (!empty($product['sku'])) {
            $code = strtoupper(trim($product['sku']));
            if (isset($productCodes[$code])) fail('Item codes must be unique.');
            $productCodes[$code] = true;
        }
    }
}
function images(array $value): array {
    foreach ($value as $key => $item) {
        if (is_array($item)) $value[$key] = images($item);
        elseif (is_string($item) && in_array($key, ['image','img','url'], true)) {
            if (strpos($item, 'data:') === 0) {
                if (!preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $item, $match)) fail('Use PNG, JPEG or WebP images.');
                $bytes = base64_decode($match[2], true);
                if ($bytes === false || strlen($bytes) > 5000000) fail('Each image must be smaller than 5 MB.');
                $info = @getimagesizefromstring($bytes);
                $mime = 'image/' . $match[1];
                if (!$info || ($info['mime'] ?? '') !== $mime || $info[0] > 8000 || $info[1] > 8000) fail('Invalid image file.');
                $filename = hash('sha256', $bytes) . '.' . ($match[1] === 'jpeg' ? 'jpg' : $match[1]);
                $directory = dirname(__DIR__) . '/uploads';
                if (!is_dir($directory) && !mkdir($directory, 0755, true)) throw new RuntimeException('Cannot create uploads directory.');
                if (file_put_contents($directory . '/' . $filename, $bytes, LOCK_EX) === false) throw new RuntimeException('Cannot save image.');
                $value[$key] = '/uploads/' . $filename;
            } elseif ($item !== '' && !preg_match('#^(https://|/(?!/))#', $item)) fail('Images must use HTTPS or a local file path.');
        }
    }
    return $value;
}

try {
    if (PHP_VERSION_ID < 80200) fail('Select PHP 8.4 for idogtc.com in the hosting panel first.', 503);
    $configPath = dirname(__DIR__, 2) . '/idogtc-config.php';
    if (!is_file($configPath)) fail('Server configuration is missing. Add idogtc-config.php beside public_html.', 503);
    $config = require $configPath;
    $site = rtrim($config['site_url'], '/');
    if (strpos($site, 'https://') !== 0) fail('Configure an HTTPS site URL.', 503);
    $db = new PDO('mysql:host=' . $config['db_host'] . ';port=' . (int)($config['db_port'] ?? 3306) . ';dbname=' . $config['db_name'] . ';charset=utf8mb4', $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    ini_set('session.use_strict_mode', '1');
    session_name('idogtc_session');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
    if (!session_start()) throw new RuntimeException('Cannot start the server session. Check session storage permissions.');
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    $route = $_GET['route'] ?? 'store';
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH'], true)) fail('Method not allowed.', 405);
    if ($method !== 'GET') {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && $origin !== $site) fail('Origin not allowed.', 403);
        if ($route !== 'setup' && !hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('Please refresh the page and try again.', 403);
    }
    if ($route === 'setup') {
        if ($method === 'GET') {
            header('Content-Type: text/html; charset=utf-8');
            header("Content-Security-Policy: default-src 'none'; form-action 'self'; frame-ancestors 'none'");
            echo '<!doctype html><html lang="en"><meta charset="utf-8"><title>IDO Setup</title><h1>IDO one-time setup</h1><form method="post"><p><label>Setup secret <input name="token" type="password" required></label></p><p><label>Admin username <input name="username" autocomplete="username" required></label></p><p><label>Admin password (at least 12 characters) <input name="password" type="password" minlength="12" autocomplete="new-password" required></label></p><button>Create database tables and admin</button></form></html>';
            exit;
        }
        if ($method !== 'POST') fail('Method not allowed.', 405);
        $token = (string)($config['setup_token'] ?? '');
        if (strlen($token) < 32 || strpos($token, 'REPLACE_') === 0 || !hash_equals($token, (string)($_POST['token'] ?? ''))) fail('Invalid setup secret.', 403);
        $username = strtolower(trim((string)($_POST['username'] ?? '')));
        $password = (string)($_POST['password'] ?? '');
        if (!preg_match('/^[a-z0-9@._-]{3,190}$/', $username) || strlen($password) < 12 || strlen($password) > 72) fail('Use a valid username and a 12–72 character password.');
        foreach (explode(';', file_get_contents(__DIR__ . '/schema.sql')) as $sql) if (trim($sql) !== '') $db->exec($sql);
        $seed = json_decode(file_get_contents(__DIR__ . '/seed.json'), true, 512, JSON_THROW_ON_ERROR);
        validateState($seed);
        $db->beginTransaction();
        // Lock the singleton row to prevent two simultaneous setup requests.
        $db->prepare('INSERT IGNORE INTO ido_store (id, payload) VALUES (1, ?)')->execute([encode($seed)]);
        stored($db, true);
        if ((int)$db->query('SELECT COUNT(*) FROM ido_admins')->fetchColumn() > 0) { $db->rollBack(); fail('Setup is already complete.', 409); }
        $db->prepare('INSERT INTO ido_admins (username, password_hash) VALUES (?, ?)')->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
        $db->commit();
        respond(['message' => 'Setup complete. Sign in at /admin using your new account. Remove setup_token from idogtc-config.php.']);
    }
    if ($route === 'session' && $method === 'GET') respond(['authenticated' => !empty($_SESSION['admin']) && ($_SESSION['expires'] ?? 0) > time(), 'csrf' => $_SESSION['csrf']]);
    if ($route === 'login' && $method === 'POST') {
        limit($db, 'login', 10, 900);
        $input = data();
        $query = $db->prepare('SELECT id, password_hash FROM ido_admins WHERE username = ?');
        $query->execute([strtolower(trim((string)($input['username'] ?? '')))]);
        $user = $query->fetch();
        if (!$user || !password_verify((string)($input['password'] ?? ''), $user['password_hash'])) fail('Invalid username or password.', 401);
        session_regenerate_id(true);
        $_SESSION['admin'] = (int)$user['id'];
        $_SESSION['expires'] = time() + 28800;
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(['authenticated' => true, 'csrf' => $_SESSION['csrf']]);
    }
    if ($route === 'logout' && $method === 'POST') {
        $_SESSION = ['csrf' => bin2hex(random_bytes(32))];
        session_regenerate_id(true);
        respond(['authenticated' => false, 'csrf' => $_SESSION['csrf']]);
    }
    if ($route === 'store' && $method === 'GET') respond(stored($db));
    if ($route === 'store' && $method === 'PUT') {
        admin();
        $input = data();
        $state = $input['state'] ?? null;
        if (!is_array($state) || array_diff(array_keys($state), ['products','slides','categories','companySettings','mediaItems','promoBanners','partners'])) fail('Invalid store data.');
        validateState($state);
        $db->beginTransaction();
        $previous = stored($db, true);
        if (($input['revision'] ?? null) !== $previous['revision']) { $db->rollBack(); fail('Another administrator changed the data. Refresh before saving again.', 409); }
        $state = images($state);
        $revision = $previous['revision'] + 1;
        $db->prepare('UPDATE ido_store SET payload = ?, revision = ? WHERE id = 1')->execute([encode($state), $revision]);
        $db->commit();
        respond(['state' => $state, 'revision' => $revision]);
    }
    if ($route === 'orders') {
        if ($method === 'GET') { admin(); respond(['orders' => orders($db)]); }
        if ($method === 'PATCH') {
            admin(); $input = data();
            if (!in_array($input['status'] ?? '', ['New','Contacted','Fulfilled'], true)) fail('Invalid order status.');
            $db->beginTransaction();
            $query = $db->prepare('SELECT payload FROM ido_orders WHERE id = ? FOR UPDATE');
            $query->execute([(string)($input['id'] ?? '')]);
            $row = $query->fetchColumn();
            if (!$row) { $db->rollBack(); fail('Order not found.', 404); }
            $order = json_decode($row, true, 512, JSON_THROW_ON_ERROR);
            $order['status'] = $input['status'];
            $db->prepare('UPDATE ido_orders SET payload = ? WHERE id = ?')->execute([encode($order), $order['id']]);
            $db->commit(); respond(['orders' => orders($db)]);
        }
        if ($method === 'POST') {
            limit($db, 'orders', 30, 3600);
            $input = data();
            if (!is_string($input['requestId'] ?? null) || !preg_match('/^[a-zA-Z0-9-]{16,64}$/', $input['requestId'])) fail('Invalid request ID.');
            if (!is_array($input['items'] ?? null) || count($input['items']) < 1 || count($input['items']) > 100) fail('Invalid order items.');
            $snapshot = stored($db);
            if (($input['revision'] ?? null) !== $snapshot['revision']) fail('Prices or products have changed. Refresh before ordering.', 409);
            $products = $snapshot['state']['products'];
            $items = []; $totalCents = 0; $hasUnpricedItems = false;
            foreach ($input['items'] as $item) {
                if (!is_array($item) || !is_int($item['quantity'] ?? null) || $item['quantity'] < 1 || $item['quantity'] > 1000000) fail('Invalid quantity.');
                $found = null;
                foreach ($products as $product) if ($product['id'] === ($item['productId'] ?? null)) { $found = $product; break; }
                if (!$found) fail('A product is no longer available. Please refresh.');
                $quote = !empty($found['priceOnRequest']);
                $hasUnpricedItems = $hasUnpricedItems || $quote;
                $cents = $quote ? 0 : (int)round((float)$found['numericPrice'] * 100);
                $totalCents += $cents * $item['quantity'];
                $items[] = ['productName' => $found['name'], 'productId' => $found['id'], 'sku' => $found['sku'] ?? '', 'quantity' => $item['quantity'], 'price' => $quote ? 'Request quote' : '$' . number_format($cents / 100, 2, '.', ''), 'priceOnRequest' => $quote];
            }
            $order = ['id' => 'ORD-' . bin2hex(random_bytes(16)), 'date' => gmdate('Y-m-d'), 'items' => $items, 'totalAmount' => $totalCents / 100, 'hasUnpricedItems' => $hasUnpricedItems, 'status' => 'New'];
            $query = $db->prepare('INSERT IGNORE INTO ido_orders (id, request_id, payload) VALUES (?, ?, ?)');
            $query->execute([$order['id'], $input['requestId'], encode($order)]);
            if ($query->rowCount() === 0) {
                $existing = $db->prepare('SELECT payload FROM ido_orders WHERE request_id = ?');
                $existing->execute([$input['requestId']]);
                $order = json_decode($existing->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
            }
            respond(['saved' => true, 'order' => $order], 201);
        }
    }
    if ($route === 'subscribe' && $method === 'POST') {
        limit($db, 'subscribe', 20, 3600); $input = data();
        $email = strtolower(trim((string)($input['email'] ?? '')));
        if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email.');
        $db->prepare('INSERT IGNORE INTO ido_subscribers (email) VALUES (?)')->execute([$email]);
        respond(['saved' => true]);
    }
    fail('Endpoint not found.', 404);
} catch (Throwable $error) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log('IDO API: ' . $error->getMessage());
    fail('The server could not complete this request. Check the server configuration or try again.', 503);
}
