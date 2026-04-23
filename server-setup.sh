#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt Server Setup Script"
echo "========================================="

# Step 1: Update system
echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Nginx
echo "[2/7] Installing Nginx..."
apt install -y nginx

# Step 3: Install Certbot for SSL
echo "[3/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Step 4: Create directory structure
echo "[4/7] Creating /opt/enovait directory structure..."
mkdir -p /opt/enovait/api
mkdir -p /opt/enovait/app
mkdir -p /opt/enovait/logs
mkdir -p /opt/enovait/ssl

# Set permissions
chown -R www-data:www-data /opt/enovait
chmod -R 755 /opt/enovait

echo "Directory structure created:"
ls -la /opt/enovait/

# Step 5: Create Nginx configuration for api.enov360.com
echo "[5/7] Creating Nginx config for api.enov360.com..."
cat > /etc/nginx/sites-available/api.enov360.com << 'EOF'
server {
    listen 80;
    server_name api.enov360.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.enov360.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /opt/enovait/ssl/api.enov360.com/fullchain.pem;
    ssl_certificate_key /opt/enovait/ssl/api.enov360.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /opt/enovait/logs/api-access.log;
    error_log /opt/enovait/logs/api-error.log;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone=$binary_remote_addr zone=api_limit:10m rate=10r/s;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/api.enov360.com /etc/nginx/sites-enabled/

echo "API Nginx config created."

# Step 6: Create Nginx configuration for app.enov360.com
echo "[6/7] Creating Nginx config for app.enov360.com..."
cat > /etc/nginx/sites-available/app.enov360.com << 'EOF'
server {
    listen 80;
    server_name app.enov360.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.enov360.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /opt/enovait/ssl/app.enov360.com/fullchain.pem;
    ssl_certificate_key /opt/enovait/ssl/app.enov360.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /opt/enovait/logs/app-access.log;
    error_log /opt/enovait/logs/app-error.log;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone=$binary_remote_addr zone=app_limit:10m rate=10r/s;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/app.enov360.com /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

echo "App Nginx config created."

# Step 7: Test and restart Nginx
echo "[7/7] Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid!"
    systemctl restart nginx
    systemctl enable nginx
    echo "Nginx restarted successfully."
else
    echo "Nginx configuration test failed!"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Basic setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Point DNS: Add A records for api.enov360.com and app.enov360.com → 46.62.211.251"
echo "2. Run SSL setup: ./setup-ssl.sh"
echo "3. Deploy your applications to:"
echo "   - API: /opt/enovait/api (port 3000)"
echo "   - App: /opt/enovait/app (port 3001)"
echo ""
