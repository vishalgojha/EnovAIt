#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt Backend Deployment Script"
echo "========================================="

# Configuration
APP_DIR="/opt/enovait/api"
LOG_DIR="/opt/enovait/logs"
ENV_FILE="$APP_DIR/.env"

echo "[1/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

echo "[2/6] Setting up backend application..."
mkdir -p $APP_DIR

# Copy backend package to server
echo "Please upload the backend package to /opt/enovait/api/"
echo "For now, we'll clone/build from the project..."

echo "[3/6] Creating systemd service for backend..."
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

echo "[4/6] Creating deployment helper script..."
cat > /opt/enovait/deploy-api.sh << 'DEPLOY_EOF'
#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt API Deployment Helper"
echo "========================================="

echo "This script assumes you've uploaded the built backend to /opt/enovait/api"
echo ""

# Check if .env exists
if [ ! -f /opt/enovait/api/.env ]; then
    echo "⚠️  No .env file found!"
    echo "Please create /opt/enovait/api/.env with the following variables:"
    echo ""
    echo "NODE_ENV=production"
    echo "PORT=3000"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_KEY=your_supabase_key"
    echo "ANTHROPIC_API_KEY=your_anthropic_key"
    echo "OPENAI_API_KEY=your_openai_key (optional)"
    echo "ARCHON_BASE_URL=http://localhost:8000 (optional)"
    echo "ARCHON_API_TOKEN=your_archon_token (optional)"
    echo ""
    read -p "Press Enter after creating .env file..."
fi

# Install production dependencies
echo "[1/3] Installing dependencies..."
cd /opt/enovait/api
npm install --production

# Build backend if not already built
if [ ! -d "dist" ]; then
    echo "[2/3] Building backend..."
    cd /opt/enovait/api
    npm run build
else
    echo "[2/3] Build directory exists, skipping build..."
fi

# Restart service
echo "[3/3] Restarting backend service..."
systemctl restart enovait-api
systemctl status enovait-api --no-pager

echo ""
echo "✅ Backend deployed!"
echo "Check logs: tail -f /opt/enovait/logs/api-access.log"
echo "Check status: systemctl status enovait-api"
DEPLOY_EOF

chmod +x /opt/enovait/deploy-api.sh

echo "[5/6] Creating environment file template..."
cat > $APP_DIR/.env.example << 'EOF'
# Environment
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# AI Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# OPENROUTER_API_KEY=sk-or-...

# Archon (optional)
# ARCHON_BASE_URL=http://localhost:8000
# ARCHON_API_TOKEN=your-archon-token

# WhatsApp (optional)
# WHATSAPP_CHANNEL=baileys|evolution|meta
# EVOLUTION_API_URL=http://localhost:8080
# EVOLUTION_API_KEY=your-evolution-key

# Email (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password

# MQTT (optional)
# MQTT_HOST=localhost
# MQTT_PORT=1883
EOF

echo "[6/6] Setting permissions..."
chown -R www-data:www-data /opt/enovait/api
chmod -R 755 /opt/enovait/api

echo ""
echo "========================================="
echo "✅ Backend setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Upload backend code: cd packages/backend && npm run build"
echo "2. Upload to server: scp -r dist package.json package-lock.json .env root@46.62.211.251:/opt/enovait/api/"
echo "3. Deploy: ssh root@46.62.211.251 '/opt/enovait/deploy-api.sh'"
echo ""
echo "Or use the deploy helper:"
echo "  ssh root@46.62.211.251"
echo "  cd /opt/enovait"
echo "  ./deploy-api.sh"
echo ""
