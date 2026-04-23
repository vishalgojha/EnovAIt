$Password = "Koolbunty@12 K capital"
$Server = "root@46.62.211.251"
$Plink = "C:\Users\visha\plink.exe"
$Pscp = "C:\Users\visha\pscp.exe"

Write-Host "Downloading PSCP..." -ForegroundColor Cyan
Invoke-WebRequest -Uri 'https://the.earth.li/~sgtatham/putty/latest/w64/pscp.exe' -OutFile $Pscp -ErrorAction SilentlyContinue

Write-Host "Uploading setup script..." -ForegroundColor Cyan
& $Pscp -batch -hostkey "SHA256:PrmAfhQf+9vP/1L6y5leaSKYjvBdjqZeEetcXHxuAWY" -pw $Password "C:\Users\visha\EnovAIt\server-setup-servebyte.sh" "${Server}:/root/" 2>&1

Write-Host "Running server setup..." -ForegroundColor Green
& $Plink -batch -hostkey "SHA256:PrmAfhQf+9vP/1L6y5leaSKYjvBdjqZeEetcXHxuAWY" -pw $Password $Server "chmod +x /root/server-setup-servebyte.sh && /root/server-setup-servebyte.sh" 2>&1
