#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt UI Deployment Script"
echo "========================================="

# Configuration
APP_DIR="/opt/enovait/app"
LOG_DIR="/opt/enovait/logs"

echo "[1/5] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

echo "[2/5] Setting up UI application..."
mkdir -p $APP_DIR

echo "[3/5] Creating systemd service for UI..."
cat > /etc/systemd/system/enovait-ui.service << 'EOF'
[Unit]
Description=EnovAIt UI Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/enovait/app
ExecStart=/usr/bin/npx serve -s -l 3001
Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/enovait/logs/app-access.log
StandardError=append:/opt/enovait/logs/app-error.log

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable enovait-ui

echo "[4/5] Creating deployment helper script..."
cat > /opt/enovait/deploy-ui.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt UI Deployment Helper"
echo "========================================="

echo "This script assumes you've uploaded the built UI to /opt/enovait/app"
echo ""

# Check if dist exists
if [ ! -d /opt/enovait/app/dist ] && [ ! -d /opt/enovait/app/build ]; then
    echo "⚠️  No build directory found!"
    echo "Please upload the built UI files to /opt/enovait/app/"
    echo "Run: cd packages/ui && npm run build"
    echo "Then upload the 'dist' folder contents to /opt/enovait/app/"
    echo ""
    read -p "Press Enter after uploading files..."
fi

# Install serve if not present
if ! command -v serve &> /dev/null; then
    echo "[1/3] Installing 'serve' package..."
    npm install -g serve
else
    echo "[1/3] 'serve' already installed..."
fi

# Create .env if not exists
if [ ! -f /opt/enovait/app/.env ]; then
    echo "[2/3] Creating .env file..."
    cat > /opt/enovait/app/.env << 'ENVEOF'
# API URL - update this to your actual API URL
VITE_API_BASE_URL=https://api.enov360.com/api/v1
ENVEOF
else
    echo "[2/3] .env file exists..."
fi

# Restart service
echo "[3/3] Restarting UI service..."
systemctl restart enovait-ui
systemctl status enovait-ui --no-pager

echo ""
echo "✅ UI deployed!"
echo "Check logs: tail -f /opt/enovait/logs/app-access.log"
echo "Check status: systemctl status enovait-ui"
DEPLOY_EOF

chmod +x /opt/enovait/deploy-ui.sh

echo "[5/5] Setting permissions..."
chown -R www-data:www-data /opt/enovait/app
chmod -R 755 /opt/enovait/app

echo ""
echo "========================================="
echo "✅ UI setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Build UI locally: cd packages/ui && npm run build"
echo "2. Upload to server: scp -r packages/ui/dist/* root@46.62.211.251:/opt/enovait/app/"
echo "3. Deploy: ssh root@46.62.211.251 '/opt/enovait/deploy-ui.sh'"
echo ""
echo "Or use the deploy helper:"
echo "  ssh root@46.62.211.251"
echo "  cd /opt/enovait"
echo "  ./deploy-ui.sh"
echo ""
