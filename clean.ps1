Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts,*.css | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $content = $content -replace '[─═]+', ''
    Set-Content $_.FullName -Value $content -Encoding UTF8
}
