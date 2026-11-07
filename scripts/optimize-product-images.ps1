param([string]$Source = 'output/imagegen/products', [string]$Destination = 'public/images/products')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
foreach ($file in Get-ChildItem -LiteralPath $Source -Filter '*.png' -File) {
    $target = Join-Path $Destination ($file.BaseName + '.jpg')
    if ((Test-Path -LiteralPath $target) -and (Get-Item -LiteralPath $target).LastWriteTimeUtc -ge $file.LastWriteTimeUtc) { continue }
    $original = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        $width = 640
        $height = [int][Math]::Round($original.Height * $width / $original.Width)
        $bitmap = [System.Drawing.Bitmap]::new($width, $height)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.DrawImage($original, 0, 0, $width, $height)
            } finally { $graphics.Dispose() }
            $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
            try {
                $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]82)
                $bitmap.Save([System.IO.Path]::GetFullPath($target), $encoder, $parameters)
            } finally { $parameters.Dispose() }
        } finally { $bitmap.Dispose() }
    } finally { $original.Dispose() }
}
Write-Output "Optimized $(@(Get-ChildItem -LiteralPath $Destination -Filter '*.jpg' -File).Count) product images."
