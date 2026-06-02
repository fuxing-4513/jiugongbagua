$action = if ($args[0]) { $args[0] } else { 'backup' }
$tag = if ($args[1]) { $args[1] } else { '' }

$projectRoot = $PSScriptRoot + '\..'
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$backupDir = $projectRoot + '\..\backups'

if ($action -eq 'list') {
  Set-Location $projectRoot
  git tag -l 'backup-*' | Sort-Object -Descending
  exit 0
}

if ($action -eq 'restore') {
  if (-not $tag) {
    Write-Host 'Usage: .\scripts\backup.ps1 restore backup-YYYY-MM-DD_HHmm' -ForegroundColor Yellow
    exit 1
  }
  Set-Location $projectRoot
  Write-Host ('Restoring to: ' + $tag) -ForegroundColor Red
  Write-Host 'Uncommitted changes will be lost! Continue? (y/N)' -ForegroundColor Yellow
  $confirm = Read-Host
  if ($confirm -ne 'y') { Write-Host 'Cancelled'; exit 0 }
  git stash
  git checkout $tag
  Write-Host ('Restored to: ' + $tag) -ForegroundColor Green
  exit 0
}

# Default: backup
Set-Location $projectRoot

Write-Host '=== Jiugong Bagua Backup ===' -ForegroundColor Cyan

# Git tag
$status = git status --porcelain
if ($status) {
  Write-Host 'Auto-committing changes...' -ForegroundColor Yellow
  git add -A
  git commit -m ('auto backup: ' + $timestamp)
}
$tagName = 'backup-' + $timestamp
git tag -a $tagName -m ('auto backup ' + $timestamp)
git push origin main --tags 2>&1 | Out-Null
Write-Host ('Git tag: ' + $tagName) -ForegroundColor Green

# Zip
Write-Host 'Creating zip...' -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$zipName = 'jiugong-bagua_backup_' + $timestamp + '.zip'
$zipPath = Join-Path $backupDir $zipName

$sources = @(
  (Join-Path $projectRoot 'src'),
  (Join-Path $projectRoot 'public'),
  (Join-Path $projectRoot 'scripts'),
  (Join-Path $projectRoot 'package.json'),
  (Join-Path $projectRoot 'package-lock.json'),
  (Join-Path $projectRoot 'tsconfig.json'),
  (Join-Path $projectRoot 'next.config.ts'),
  (Join-Path $projectRoot 'postcss.config.mjs'),
  (Join-Path $projectRoot '.gitignore')
)
Compress-Archive -Path $sources -DestinationPath $zipPath -Force

$zipObj = Get-Item $zipPath
$sizeMB = [math]::Round($zipObj.Length / 1048576, 2)
$msg = 'Zip: ' + $zipName + ' (' + [string]$sizeMB + ' MB)'
Write-Host $msg -ForegroundColor Green

# Clean old zips (keep 10)
$oldZips = Get-ChildItem $backupDir -Filter 'jiugong-bagua_backup_*.zip' | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10
foreach ($old in $oldZips) {
  Remove-Item $old.FullName
  Write-Host ('Removed old: ' + $old.Name) -ForegroundColor DarkGray
}

Write-Host 'Backup complete!' -ForegroundColor Green
