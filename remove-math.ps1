Remove-Item 'apps/web/src/components/math' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/pages/math' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/composables/math' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/stores/math.store.ts' -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/services/math.service.ts' -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/types/math.types.ts' -Force -ErrorAction SilentlyContinue
Remove-Item 'apps/web/src/locales/math.ts' -Force -ErrorAction SilentlyContinue
Write-Host 'math section removed'
