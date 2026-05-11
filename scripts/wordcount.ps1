$root = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path } else { 'E:\ConvertPDF' }

function Get-HtmlWordCount([string]$path) {
    $raw = Get-Content -LiteralPath $path -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $raw) { return 0 }
    $t = $raw -replace '(?is)<script\b[^>]*>.*?</script>', ' '
    $t = $t -replace '(?is)<style\b[^>]*>.*?</style>', ' '
    $t = $t -replace '<[^>]+>', ' '
    $t = $t -replace '\s+', ' '
    $w = ($t.Trim() -split '\s+')
    if ($w.Count -eq 1 -and $w[0] -eq '') { return 0 }
    return $w.Count
}

$out = @()
$out += '--- blog (excl index) ---'
Get-ChildItem -LiteralPath (Join-Path $root 'blog') -Filter '*.html' | Where-Object { $_.Name -ne 'index.html' } | ForEach-Object {
    $out += "{0,5}  {1}" -f (Get-HtmlWordCount $_.FullName), $_.Name
}
$out += '--- pages ---'
Get-ChildItem -LiteralPath (Join-Path $root 'pages') -Filter '*.html' | ForEach-Object {
    $out += "{0,5}  {1}" -f (Get-HtmlWordCount $_.FullName), $_.Name
}
$out += '--- site ---'
foreach ($f in @('index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', '404.html', 'all-tools.html')) {
    $p = Join-Path $root $f
    if (Test-Path -LiteralPath $p) { $out += "{0,5}  {1}" -f (Get-HtmlWordCount $p), $f }
}
$ap = Join-Path $root 'author\anant.html'
if (Test-Path -LiteralPath $ap) { $out += "{0,5}  author\anant.html" -f (Get-HtmlWordCount $ap) }

$dest = Join-Path $root 'scripts\wordcount-out.txt'
$out | Set-Content -LiteralPath $dest -Encoding UTF8
Write-Host "Wrote $dest"
