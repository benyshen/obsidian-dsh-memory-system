# AImemory install — install the aimemory DSH skill / agent preset / profile
# and (optionally) a memory vault into a DeepSeek Harness installation.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File install.ps1
#       # install skill + preset + profile into $DSH_HOME (default vault = repo root)
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Vault D:\path\to\myvault
#       # also scaffold a fresh memory vault at D:\path\to\myvault
#   powershell -ExecutionPolicy Bypass -File install.ps1 -DshHome C:\custom\.dsh
#       # use a custom DSH_HOME
#
# What it installs (idempotent; existing user files are preserved):
#   $DSH_HOME/skills/aimemory.md          the aimemory SKILL (model-invocable)
#   $DSH_HOME/.agent-presets/aimemory/    agent preset (memory plugin + note tools)
#   $DSH_HOME/profiles/aimemory/          the `dsh --profile aimemory` profile
#   <vault>/.deepseek/... + AGENTS.md     memory vault templates (when -Vault given)

param(
    [string]$Vault = "",
    [string]$DshHome = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
$PresetId = "aimemory"
$ProfileName = "aimemory"
if ($DshHome -eq "") { $DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME ".dsh" } }
if ($Vault -eq "") { $Vault = $RepoRoot }

Write-Host "==> AImemory installer"
Write-Host "    repo:   $RepoRoot"
Write-Host "    vault:  $Vault"
Write-Host "    dshHome: $DshHome"

# 1. DSH skill — $DSH_HOME/skills/aimemory.md (DSH skill provider scans this dir)
$skillsRoot = Join-Path $DshHome "skills"
New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
Copy-Item -Force (Join-Path $RepoRoot "SKILL.md") (Join-Path $skillsRoot "aimemory.md")
Write-Host "[ok] skill      -> $skillsRoot\aimemory.md"

# 2. agent preset — $DSH_HOME/.agent-presets/aimemory/
$presetRoot = Join-Path $DshHome ".agent-presets\$PresetId"
New-Item -ItemType Directory -Force -Path $presetRoot | Out-Null
Copy-Item -Force (Join-Path $RepoRoot ".dsh-preset\*") $presetRoot
Write-Host "[ok] agent preset -> $presetRoot"

# 3. profile — $DSH_HOME/profiles/aimemory/
$profileRoot = Join-Path $DshHome "profiles\$ProfileName"
New-Item -ItemType Directory -Force -Path $profileRoot | Out-Null
Copy-Item -Force (Join-Path $RepoRoot ".dsh-profile\*") $profileRoot
Write-Host "[ok] profile    -> $profileRoot"

# 4. memory vault templates — <vault>/AGENTS.md + .deepseek/... (preserve user edits)
$vaultFiles = @(
    @("AGENTS.md", "AGENTS.md"),
    @(".deepseek\memory\profile.md", ".deepseek\memory\profile.md"),
    @(".deepseek\memory\notation.md", ".deepseek\memory\notation.md"),
    @(".deepseek\memory\topics\index.md", ".deepseek\memory\topics\index.md"),
    @(".deepseek\memory\records\_README.md", ".deepseek\memory\records\_README.md"),
    @(".deepseek\memory\records\index.md", ".deepseek\memory\records\index.md"),
    @(".deepseek\memory\theorems\_README.md", ".deepseek\memory\theorems\_README.md"),
    @(".deepseek\memory\theorems\index.md", ".deepseek\memory\theorems\index.md"),
    @(".deepseek\memory\templates\_README.md", ".deepseek\memory\templates\_README.md"),
    @(".deepseek\memory\templates\index.md", ".deepseek\memory\templates\index.md"),
    @(".deepseek\memory\episodes\_README.md", ".deepseek\memory\episodes\_README.md"),
    @(".deepseek\memory\episodes\index.md", ".deepseek\memory\episodes\index.md"),
    @(".deepseek\inbox\_README.md", ".deepseek\inbox\_README.md"),
    @(".deepseek\inbox\index.md", ".deepseek\inbox\index.md"),
    @(".deepseek\capture-policy.md", ".deepseek\capture-policy.md")
)
$vaultWritten = 0
foreach ($pair in $vaultFiles) {
    $target = Join-Path $Vault $pair[1]
    if (Test-Path $target) { continue }   # preserve existing user file
    $src = Join-Path $RepoRoot $pair[0]
    if (-not (Test-Path $src)) { continue }
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    Copy-Item -Force $src $target
    $vaultWritten++
}
Write-Host "[ok] vault templates -> $Vault  (created $vaultWritten files, preserved existing)"

Write-Host ""
Write-Host "Done. Start the service with:"
Write-Host "  powershell -ExecutionPolicy Bypass -File $RepoRoot\start.ps1"
Write-Host "  (or double-click $RepoRoot\start-aimemory.cmd), then open http://127.0.0.1:3180"
Write-Host ""
Write-Host "The aimemory SKILL is now available to any DSH session whose scope"
Write-Host "reaches $DshHome (model can load it via the skill tool)."
