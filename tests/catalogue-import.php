<?php
declare(strict_types=1);
require __DIR__ . '/../hosting/catalogue-import.php';
function check(bool $condition, string $message): void { if (!$condition) throw new RuntimeException($message); }
$manifest = json_decode(file_get_contents(__DIR__ . '/../catalogue/idogtc-catalogue-2026-11.json'), true, 512, JSON_THROW_ON_ERROR);
$original = ['products' => [['id' => 45, 'sku' => 'EXISTING', 'name' => 'Existing product', 'price' => '$12.00']], 'categories' => [], 'companySettings' => ['header' => ['brandPrimary' => 'Owner brand']], 'partners' => [['id' => 'original']]];
$result = mergeIdoCatalogue($original, $manifest);
check($result['added'] === 246 && $result['categoriesAdded'] === 18, 'Import counts differ.');
check($result['state']['products'][0] === $original['products'][0], 'Existing product changed.');
check($result['state']['companySettings'] === $original['companySettings'], 'Company settings changed.');
check($result['state']['partners'] === $original['partners'], 'Partners changed.');
$again = mergeIdoCatalogue($result['state'], $manifest);
check($again['added'] === 0 && $again['skipped'] === 246, 'Reimport duplicates products.');
check($again['state'] === $result['state'], 'Reimport changes data.');
$edited = $result['state'];
$edited['products'][1]['name'] = 'Owner edited name';
$edited['products'][1]['price'] = '$55.00';
$edited['categories'][0]['name'] = 'Owner renamed category';
check(mergeIdoCatalogue($edited, $manifest)['state'] === $edited, 'Reimport overwrites owner edits.');
$codes = array_column($result['state']['products'], 'sku');
check(count(array_unique($codes)) === 247, 'Item codes not unique.');
$scaffolding = array_values(array_filter($manifest['products'], fn($p) => $p['name'] === 'Steel Scaffolding'));
check(count($scaffolding) === 2 && $scaffolding[0]['sku'] !== $scaffolding[1]['sku'], 'Distinct scaffolding codes lost.');
foreach ($manifest['products'] as $p) {
    check($p['priceOnRequest'] && $p['numericPrice'] === 0 && $p['rating'] === 0 && $p['reviews'] === 0 && $p['origin'] === '', 'Unknown commercial data fabricated.');
    check(is_file(__DIR__ . '/../public' . $p['image']), 'Product illustration missing.');
}
echo "Catalogue merge checks passed: 246 products, 18 categories, preserved data, repeat-safe import.\n";
