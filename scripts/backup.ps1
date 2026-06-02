# 九宫八卦 源码备份脚本
# 用法: .\scripts\backup.ps1
# 自动创建 tagged backup + zip 压缩包

param(
  [switch]$ZipOnly,       # 只打包 zip，不创建 git tag
  [switch]$Restore,       # 恢复模式：列出所有 backup tag
  [string]$RestoreTag     # 恢复到指定 tag
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupDir = Join-Path $projectRoot "..\backups"
$zipName = "jiugong-bagua_backup_$timestamp.zip"

if ($Restore) {
  Set-Location $projectRoot
  Write-Host "=== 可用备份 Tags ===" -ForegroundColor Cyan
  git tag -l "backup-*" | Sort-Object -Descending
  Write-Host ""
  Write-Host "恢复命令: .\scripts\backup.ps1 -RestoreTag backup-YYYY-MM-DD_HHmm" -ForegroundColor Yellow
  exit 0
}

if ($RestoreTag) {
  Set-Location $projectRoot
  Write-Host "⚠️ 即将恢复到: $RestoreTag" -ForegroundColor Red
  Write-Host "当前未提交的改动将丢失！继续？(y/N)" -ForegroundColor Yellow
  $confirm = Read-Host
  if ($confirm -ne 'y') { Write-Host "已取消"; exit 0 }
  
  # 先备份当前状态
  git stash
  git checkout $RestoreTag
  Write-Host "✅ 已恢复到 $RestoreTag" -ForegroundColor Green
  Write-Host "提示: git checkout main 可回到最新版本" -ForegroundColor Cyan
  exit 0
}

Set-Location $projectRoot

Write-Host "📦 九宫八卦 备份中..." -ForegroundColor Cyan

# 1. Git tag backup
if (-not $ZipOnly) {
  # 确保所有改动已提交
  $status = git status --porcelain
  if ($status) {
    Write-Host "⚠️ 有未提交的改动，先自动提交..." -ForegroundColor Yellow
    git add -A
    git commit -m "auto backup before tag: $timestamp"
  }
  git tag -a "backup-$timestamp" -m "auto backup $timestamp"
  git push origin main --tags 2>&1 | Out-Null
  Write-Host "✅ Git tag backup-$timestamp 已创建并推送" -ForegroundColor Green
}

# 2. Zip backup to parent directory
Write-Host "📁 创建 zip 压缩包..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$zipPath = Join-Path $backupDir $zipName

# 排除 node_modules, .next, out, .git
Compress-Archive -Path @(
  "$projectRoot\src",
  "$projectRoot\public",
  "$projectRoot\scripts",
  "$projectRoot\package.json",
  "$projectRoot\package-lock.json",
  "$projectRoot\tsconfig.json",
  "$projectRoot\next.config.*",
  "$projectRoot\tailwind.config.*",
  "$projectRoot\postcss.config.*",
  "$projectRoot\.gitignore",
  "$projectRoot\*.md",
  "$projectRoot\AGENTS.md",
  "$projectRoot\MEMORY.md",
  "$projectRoot\SOUL.md",
  "$projectRoot\TOOLS.md"
) -DestinationPath $zipPath -Force

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ("Zip backup: $zipName ({0} MB)" -f $sizeMB) -ForegroundColor Green
Write-Host "   Path: $zipPath" -ForegroundColor Gray

# 3. 清理旧备份（保留最近 10 个 zip）
$oldZips = Get-ChildItem $backupDir -Filter "jiugong-bagua_backup_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10
foreach ($old in $oldZips) {
  Remove-Item $old.FullName
  Write-Host "🗑 清理旧备份: $($old.Name)" -ForegroundColor DarkGray
}

# 4. 清理旧 git tags（保留最近 30 个）
$oldTags = git tag -l "backup-*" | Sort-Object -Descending | Select-Object -Skip 30
foreach ($tag in $oldTags) {
  git tag -d $tag 2>&1 | Out-Null
  git push origin --delete $tag 2>&1 | Out-Null
  Write-Host "🗑 清理旧 tag: $tag" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "✅ 备份完成！" -ForegroundColor Green
Write-Host "   快速恢复: .\scripts\backup.ps1 -RestoreTag backup-$timestamp" -ForegroundColor Cyan
