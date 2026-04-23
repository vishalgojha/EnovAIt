#!/bin/bash
set -e

echo "========================================="
echo "SSL Certificate Setup with Certbot"
echo "========================================="

# Create SSL directories
mkdir -p /opt/enovait/ssl/api.enov360.com
mkdir -p /opt/enovait/ssl/app.enov360.com

echo "Obtaining SSL certificate for api.enov360.com..."
certbot --nginx -d api.enov360.com --non-interactive --agree-tos --register-unsafely-without-email

echo "Obtaining SSL certificate for app.enov360.com..."
certbot --nginx -d app.enov360.com --non-interactive --agree-tos --register-unsafely-without-email

echo ""
echo "========================================="
echo "✅ SSL certificates installed!"
echo "========================================="
echo ""
echo "Auto-renewal is configured. Certificates will renew automatically."
echo ""
echo "Verify your sites:"
echo "  - https://api.enov360.com"
echo "  - https://app.enov360.com"
echo ""
