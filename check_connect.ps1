
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   TRUEFUND CONNECTION DIAGNOSTIC TOOL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Get IP Address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*vEthernet*" }).IPAddress | Select-Object -First 1

if (-not $ip) {
    Write-Host "❌ ERROR: No valid WiFi/Ethernet IP found." -ForegroundColor Red
} else {
    Write-Host "✅ YOUR PC IP ADDRESS: $ip" -ForegroundColor Green
    Write-Host "   (Enter THIS number in the Android App)" -ForegroundColor Yellow
}

# 2. Check Port 3000
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "✅ SERVER STATUS: Running (Port 3000 is Open)" -ForegroundColor Green
} else {
    Write-Host "❌ SERVER STATUS: Not Running!" -ForegroundColor Red
    Write-Host "   (Please run 'npm run start' in VS Code first)" -ForegroundColor Gray
}

# 3. Check Firewall
Write-Host "`nchecking Firewall rules..." -ForegroundColor Gray
$rule = Get-NetFirewallRule -DisplayName "Node.js JavaScript Runtime" -ErrorAction SilentlyContinue
if ($rule) {
    Write-Host "⚠️  Firewall Rules found. If connection fails, try disabling Firewall temporarily." -ForegroundColor Yellow
} else {
    Write-Host "❓ No specific Node.js firewall rule found." -ForegroundColor Gray
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TROUBLESHOOTING STEPS:" -ForegroundColor White
Write-Host "1. Ensure Phone and PC are on the SAME WiFi."
Write-Host "2. Disable Mobile Data on Phone."
Write-Host "3. Turn off Windows Firewall temporarily to test."
Write-Host "==========================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit..."
