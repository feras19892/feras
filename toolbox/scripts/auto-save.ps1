# Auto-save script — commits changes every 5 minutes
$repo = "C:\Users\feras\Desktop\feras"
$interval = 300  # seconds (5 minutes)

function Auto-Save {
    Set-Location $repo
    $status = git status --porcelain 2>$null
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git add . >$null 2>&1
        git commit -m "auto-save: $timestamp" >$null 2>&1
        Write-Host "💾 Auto-saved at $timestamp" -ForegroundColor Green
    }
}

Write-Host "🔁 Git auto-save started (every 5 min). Press Ctrl+C to stop."
while ($true) {
    Auto-Save
    Start-Sleep -Seconds $interval
}
