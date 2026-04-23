# EnovAIt Auto Deployment Script
$Password = "Koolbunty@12 K capital"
$Server = "46.62.211.251"
$User = "root"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "EnovAIt Automated Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Step 1: Accept host key (first run only)
Write-Host "`n[Step 1] Checking SSH connection..." -ForegroundColor Yellow
$process = Start-Process -FilePath "C:\Users\visha\plink.exe" -ArgumentList "-pw", $Password, "$User@$Server", "echo 'OK'" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\ssh_test.txt" -RedirectStandardError "$env:TEMP\ssh_err.txt"

# Step 2: Upload server setup script
Write-Host "[Step 2] Downloading PSCP..." -ForegroundColor Yellow
Invoke-WebRequest -Uri 'https://the.earth.li/~sgtatham/putty/latest/w64/pscp.exe' -OutFile 'C:\Users\visha\pscp.exe' -ErrorAction SilentlyContinue

Write-Host "[Step 3] Uploading setup script..." -ForegroundColor Yellow
$pscpArgs = "-pw", $Password, "C:\Users\visha\EnovAIt\server-setup-servebyte.sh", "$User@$Server:/root/"
Start-Process -FilePath "C:\Users\visha\pscp.exe" -ArgumentList $pscpArgs -NoNewWindow -Wait

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Upload complete! Now run on the server:" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ssh root@46.62.211.251" -ForegroundColor White
Write-Host "chmod +x /root/server-setup-servebyte.sh" -ForegroundColor White
Write-Host "/root/server-setup-servebyte.sh" -ForegroundColor White
Write-Host ""
Write-Host "After server setup completes, run:" -ForegroundColor Yellow
Write-Host "bash deploy-all.sh" -ForegroundColor White
Write-Host ""
