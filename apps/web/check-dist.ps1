Get-ChildItem dist\assets\*.js | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $kb = [math]::Round($_.Length/1024, 1)
    Write-Output ("{0,-50} {1,10} KB" -f $_.Name, $kb)
}
