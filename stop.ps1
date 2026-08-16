# 停止 AImemory 长期记忆服务（按端口 3180 查找并结束）
Get-NetTCPConnection -LocalPort 3180 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
  if ($proc) { Write-Host "Stopping $($proc.ProcessName) (PID $($proc.Id)) on port 3180"; Stop-Process -Id $proc.Id -Force }
}
