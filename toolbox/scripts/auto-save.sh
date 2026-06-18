#!/bin/bash
# Auto-save script for Git Bash — commits changes every 5 minutes
# Usage: bash auto-save.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
INTERVAL=300  # seconds (5 minutes)

cd "$REPO" || { echo "Cannot find repo"; exit 1; }

echo "🔁 Git auto-save started in: $REPO"
echo "   (every 5 min, Press Ctrl+C to stop)"

while true; do
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    git add . >/dev/null 2>&1
    git commit -m "auto-save: $TIMESTAMP" >/dev/null 2>&1
    echo "💾 Auto-saved at $TIMESTAMP"
  fi
  sleep $INTERVAL
done
