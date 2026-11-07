<?php
declare(strict_types=1);
function fail(string $message, int $status = 400): void { throw new RuntimeException($message); }
function textFields(array $record, array $fields): void { foreach ($fields as $field) if (!isset($record[$field]) || !is_string($record[$field])) fail('Invalid text.'); }
$source = file_get_contents(__DIR__ . '/../hosting/api/index.php');
$start = strpos($source, 'function validateFooter(');
$end = strpos($source, 'function validateState(', $start);
eval(substr($source, $start, $end - $start));
$text = ['en' => 'Footer text', 'so' => 'Qoraalka footer-ka'];
$footer = [
    'description' => $text, 'copyright' => $text,
    'labels' => array_fill_keys(['contact','shop','account','newsletter','newsletterDescription','emailPlaceholder','subscribe','social','domain'], $text),
    'visibility' => array_fill_keys(['enabled','contact','shop','account','newsletter','social','copyright','domain'], true),
    'social' => ['facebook' => 'https://facebook.com/example', 'instagram' => '', 'twitter' => '', 'linkedin' => ''],
    'shopLinks' => [['id' => 'cement', 'label' => $text, 'target' => 'category:excel-bm-01', 'visible' => true]],
    'accountLinks' => [['id' => 'cart', 'label' => $text, 'target' => 'cart', 'visible' => false]],
];
validateFooter($footer);
foreach (['javascript:alert(1)', 'http://facebook.com/example', 'https://user:password@example.com'] as $url) {
    $bad = $footer; $bad['social']['facebook'] = $url;
    try { validateFooter($bad); throw new LogicException('Unsafe social URL accepted.'); } catch (RuntimeException $expected) {}
}
$bad = $footer; $bad['shopLinks'][0]['target'] = 'javascript:alert(1)';
try { validateFooter($bad); throw new LogicException('Invalid menu target accepted.'); } catch (RuntimeException $expected) {}
$bad = $footer; $bad['shopLinks'][] = $bad['shopLinks'][0];
try { validateFooter($bad); throw new LogicException('Duplicate link ID accepted.'); } catch (RuntimeException $expected) {}
$bad = $footer; $bad['visibility']['enabled'] = 'yes';
try { validateFooter($bad); throw new LogicException('Invalid visibility accepted.'); } catch (RuntimeException $expected) {}
echo "Footer validation passed: translations, category links, visibility, safe social URLs and duplicate IDs.\n";
