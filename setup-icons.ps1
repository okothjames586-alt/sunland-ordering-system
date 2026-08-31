Add-Type -AssemblyName System.Drawing

# Icon sizes for different densities
$iconSizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

$sourceImage = "c:\Users\Caleb Opala\OneDrive\Desktop\Sunlannd Ordering app\sunland icon.png"
$androidResPath = "c:\Users\Caleb Opala\OneDrive\Desktop\Sunlannd Ordering app\client\android\app\src\main\res"

if (-not (Test-Path $sourceImage)) {
    Write-Host "ERROR: Source image not found at $sourceImage" -ForegroundColor Red
    exit 1
}

Write-Host "Loading source image..." -ForegroundColor Green
$img = [System.Drawing.Image]::FromFile($sourceImage)
Write-Host "Original size: $($img.Width)x$($img.Height)" -ForegroundColor Green

foreach ($folder in $iconSizes.Keys) {
    $size = $iconSizes[$folder]
    $outputDir = "$androidResPath\$folder"
    
    # Create resized bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($img, 0, 0, $size, $size)
    $graphics.Dispose()
    
    # Save ic_launcher.png
    $icLauncherPath = "$outputDir\ic_launcher.png"
    $bitmap.Save($icLauncherPath)
    Write-Host "Created $folder/ic_launcher.png (${size}x${size})" -ForegroundColor Green
    
    # Save ic_launcher_round.png
    $icLauncherRoundPath = "$outputDir\ic_launcher_round.png"
    $bitmap.Save($icLauncherRoundPath)
    Write-Host "Created $folder/ic_launcher_round.png (${size}x${size})" -ForegroundColor Green
    
    $bitmap.Dispose()
}

$img.Dispose()

Write-Host "`nSUCCESS! App icons have been set up for all densities." -ForegroundColor Green
Write-Host "Your SWG logo is now ready as the app icon!" -ForegroundColor Green
