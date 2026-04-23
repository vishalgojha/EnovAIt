$Password = "Koolbunty@12 K capital"
$Plink = "C:\Users\visha\plink.exe"

Write-Host "Testing SSH connection..." -ForegroundColor Cyan

$proc = Start-Process -FilePath $Plink -ArgumentList "-pw", $Password, "-P", "22", "root", "46.62.211.251", "echo SUCCESS" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\ssh_out.txt" -RedirectStandardError "$env:TEMP\ssh_err.txt"

Get-Content "$env:TEMP\ssh_out.txt" -ErrorAction SilentlyContinue
Get-Content "$env:TEMP\ssh_err.txt" -ErrorAction SilentlyContinue
