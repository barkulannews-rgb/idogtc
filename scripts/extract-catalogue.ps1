param([Parameter(Mandatory=$true)][string]$InputPath, [string]$OutputPath = 'catalogue/idogtc-catalogue-2026-11.json')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $InputPath).Path)
function Read-Entry([string]$name) {
    $reader = [System.IO.StreamReader]::new($archive.GetEntry($name).Open())
    try { $reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
    $strings = @()
    if ($archive.GetEntry('xl/sharedStrings.xml')) {
        [xml]$shared = Read-Entry 'xl/sharedStrings.xml'
        $strings = @($shared.SelectNodes('//*[local-name()="si"]') | ForEach-Object { ($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' })
    }
    [xml]$sheet = Read-Entry 'xl/worksheets/sheet1.xml'
    $rows = @($sheet.SelectNodes('//*[local-name()="sheetData"]/*[local-name()="row"]') | Select-Object -Skip 1 | ForEach-Object {
        $record = @{}
        foreach ($cell in $_.SelectNodes('./*[local-name()="c"]')) {
            $node = $cell.SelectSingleNode('./*[local-name()="v"]')
            $value = if ($node) { $node.InnerText } else { '' }
            if ($cell.GetAttribute('t') -eq 's') { $value = $strings[[int]$value] }
            elseif ($cell.GetAttribute('t') -eq 'inlineStr') { $value = ($cell.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' }
            $record[$cell.GetAttribute('r') -replace '\d',''] = $value.Trim()
        }
        if ($record['A']) { $record }
    })
    if ($rows.Count -ne 246 -or @($rows | ForEach-Object { $_['A'] } | Sort-Object -Unique).Count -ne 246) { throw 'Expected 246 unique item codes in the Master Catalogue.' }
    $categories = @()
    $products = @()
    foreach ($row in $rows) {
        $code = $row['A']; $name = $row['C']; $category = $row['B']; $unit = $row['E']
        if (!$name -or !$category -or !$unit -or $code -notmatch '^(BM|PT)-\d{4}$') { throw "Incomplete product row: $code" }
        if ($row['I']) { throw 'Selling prices need a confirmed currency before import.' }
        $group = if ($code.StartsWith('BM-')) { 'Building Materials' } else { 'Paints & Coatings' }
        $existing = @($categories | Where-Object { $_.name -eq $category })
        if ($existing.Count -eq 0) {
            $id = 'excel-' + $code.Substring(0,2).ToLowerInvariant() + '-' + ($categories.Count + 1).ToString('00')
            $categories += [ordered]@{ id=$id; name=$category; catalogueGroup=$group; img="/images/catalogue/$id.svg"; count='0 Products' }
            $existing = @($categories[-1])
        }
        $specs = if ($row['D']) { $row['D'] + ' | Unit: ' + $unit } else { 'Unit: ' + $unit }
        $products += [ordered]@{
            sku=$code; name=$name; category=$category; catalogueGroup=$group; unit=$unit; specs=$specs
            price='Request quote'; oldPrice=''; numericPrice=0; priceOnRequest=$true
            rating=0; reviews=0; origin=''; image=$existing[0].img; imageIsIllustration=$true; isFeatured=$false
        }
    }
    foreach ($category in $categories) { $category.count = [string]@($products | Where-Object { $_.category -eq $category.name }).Count + ' Products' }
    $result = [ordered]@{ batch='idogtc-catalogue-2026-11'; source=[System.IO.Path]::GetFileName($InputPath); sourceSha256=(Get-FileHash -LiteralPath $InputPath -Algorithm SHA256).Hash.ToLowerInvariant(); categories=$categories; products=$products }
    $parent = Split-Path -Parent $OutputPath
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    [System.IO.File]::WriteAllText((Join-Path (Get-Location).Path $OutputPath), ($result | ConvertTo-Json -Depth 8), [System.Text.UTF8Encoding]::new($false))
    Write-Output "Prepared $($products.Count) products and $($categories.Count) categories. Private cost/supplier columns are excluded."
} finally { $archive.Dispose() }
