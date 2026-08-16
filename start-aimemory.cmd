@echo off
rem AImemory long-term memory service (aimemory profile, port 3180)
rem Uses the current directory as the vault; set DSH_AIMEMORY_VAULT to override.
if "%DSH_AIMEMORY_VAULT%"=="" set DSH_AIMEMORY_VAULT=%~dp0
if "%DSH_HOME%"=="" set DSH_HOME=%USERPROFILE%\.dsh
node "%DSH_HOME%\profiles\node_modules\@deepseek-ai\dsh\lib\bin.js" --profile aimemory --patch "%DSH_HOME%\profiles\aimemory\aimemory.patch.yml" --port 3180
