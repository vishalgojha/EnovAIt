#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt Server Setup (IP Access)"
echo "========================================="

# Step 1: Update system
echo "[1/6] Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Node.js 20
echo "[2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# Step 3: Install Caddy
echo "[3/6] Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod o+r /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy
caddy version

# Step 4: Create directory structure
echo "[4/6] Creating /opt/enovait directory structure..."
mkdir -p /opt/enovait/api
mkdir -p /opt/enovait/app
mkdir -p /opt/enovait/logs

# Set permissions
chown -R www-data:www-data /opt/enovait
chmod -R 755 /opt/enovait

echo "Directory structure created:"
ls -la /opt/enovait/

# Step 5: Create Caddy configuration for IP-based access
echo "[5/6] Creating Caddy config for IP access..."
cat > /etc/caddy/Caddyfile << 'EOF'
# BEGIN ENOVAIT IP
http://46.62.211.251 {
    encode gzip

    handle /api/* {
        reverse_proxy 127.0.0.1:3000
    }

    handle /ws/* {
        reverse_proxy 127.0.0.1:3000
    }

    handle {
        root * /opt/enovait/app
        try_files {path} /index.html
        file_server
    }
}
# END ENOVAIT IP
EOF

echo "IP-based Caddy config created."

# Step 6: Create systemd service for backend
echo "[6/6] Creating systemd service for backend..."

cat > /etc/systemd/system/enovait-api.service << 'EOF'
[Unit]
Description=EnovAIt Backend API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/enovait/api
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/enovait/logs/api-access.log
StandardError=append:/opt/enovait/logs/api-error.log

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable enovait-api

echo "Systemd service created."

# Test and restart Caddy
echo "Validating Caddy configuration..."
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

if [ $? -eq 0 ]; then
    echo "Caddy configuration is valid!"
    systemctl enable caddy
    systemctl restart caddy
    echo "Caddy restarted successfully."
else
    echo "Caddy configuration test failed!"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Server setup complete!"
echo "========================================="
echo ""
echo "Access via IP address:"
echo "  UI:     http://46.62.211.251"
echo "  API:    http://46.62.211.251/api/*"
echo ""
echo "Next steps:"
echo "1. Upload backend to /opt/enovait/api"
echo "2. Upload UI build to /opt/enovait/app"
echo "3. Run: bash deploy-all.sh"
echo ""
