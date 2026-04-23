$Password = "Koolbunty@12 K capital"
$Plink = "C:\Users\visha\plink.exe"

Write-Host "Running server setup..." -ForegroundColor Cyan

$cmd = "& `"$Plink`" -hostkey `"SHA256:PrmAfhQf+9vP/1L6y5leaSKYjvBdjqZeEetcXHxuAWY`" -pw `"$Password`" root@46.62.211.251 `"apt update && echo DONE`""
Invoke-Expression $cmd
