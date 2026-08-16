# 启动 AImemory 长期记忆服务（aimemory profile，端口 3180）
# 动态解析 DSH_HOME 与 dsh bin，方便在任意机器使用。
$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$env:DSH_AIMEMORY_VAULT = $env:DSH_AIMEMORY_VAULT
if (-not $env:DSH_AIMEMORY_VAULT) { $env:DSH_AIMEMORY_VAULT = $RepoRoot }

$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME ".dsh" }
$PatchPath = Join-Path $DshHome "profiles\aimemory\aimemory.patch.yml"
$BinCandidates = @(
    (Join-Path $DshHome "profiles\node_modules\@deepseek-ai\dsh\lib\bin.js"),
    (Join-Path $RepoRoot "node_modules\@deepseek-ai\dsh\lib\bin.js")
)
$Bin = $BinCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Bin) {
    Write-Host "ERROR: dsh bin not found. Install via install.ps1 first (or run install.ps1 to refresh)." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $PatchPath)) {
    Write-Host "ERROR: aimemory profile not found at $PatchPath. Run install.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "==> AImemory service"
Write-Host "    vault: $env:DSH_AIMEMORY_VAULT"
Write-Host "    dshHome: $DshHome"
Write-Host "    bin: $Bin"
node $Bin --profile aimemory --patch $PatchPath --port 3180
