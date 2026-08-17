$dirs = @(
    'c:\Users\feras\Desktop\feras\apps\web\src',
    'c:\Users\feras\Desktop\feras\apps\api\src',
    'c:\Users\feras\Desktop\feras\packages'
)
foreach ($dir in $dirs) {
    $files = Get-ChildItem -Path $dir -Recurse -Include '*.vue','*.ts'
    foreach ($f in $files) {
        $lc = (Get-Content $f.FullName).Count
        if ($lc -gt 300) {
            Write-Output ($f.FullName + ': ' + $lc + ' lines')
        }
    }
}
