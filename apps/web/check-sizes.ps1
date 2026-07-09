Get-ChildItem src\locales\experiments\*.ts | ForEach-Object {
    $kb = [math]::Round($_.Length/1024, 1)
    Write-Output ("{0,-15} {1,10} KB" -f $_.Name, $kb)
}
Write-Output "---"
Get-ChildItem src\locales\*.ts | ForEach-Object {
    $kb = [math]::Round($_.Length/1024, 1)
    Write-Output ("{0,-15} {1,10} KB" -f $_.Name, $kb)
}
