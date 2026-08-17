param([string]$dir, [int]$threshold = 300)
Get-ChildItem -Path $dir -Recurse -Filter '*.ts' | ForEach-Object {
    $count = (Get-Content $_.FullName).Count
    if ($count -gt $threshold) {
        Write-Output ("{0} ({1} lines)" -f $_.FullName, $count)
    }
}
