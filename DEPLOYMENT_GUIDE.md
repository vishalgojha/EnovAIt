# EnovAIt Deployment Guide

## 📋 Prerequisites

- ✅ Hetzner server: `46.62.211.251`
- ✅ SSH access: `root@46.62.211.251`
- ✅ Domains: `api.enov360.com` and `app.enov360.com`
- ✅ DNS A records pointing to `46.62.211.251`

---

## 🚀 Quick Start

### Option 1: Automated Full Deployment
```bash
# Run from project root (C:\Users\visha\EnovAIt)
bash deploy-all.sh
```
This will:
1. Build backend and UI locally
2. Upload to server
3. Install dependencies
4. Start services
5. Verify deployment

### Option 2: Step-by-Step Deployment

#### Step 1: Server Setup
```bash
# Upload setup scripts
scp server-setup.sh root@46.62.211.251:/root/
scp setup-ssl.sh root@46.62.211.251:/root/

# SSH into server
ssh root@46.62.211.251

# Run server setup
chmod +x /root/server-setup.sh
/root/server-setup.sh
```

#### Step 2: Configure DNS
Add these A records in your DNS provider:
```
Type: A    Name: api    Value: 46.62.211.251    TTL: 300
Type: A    Name: app    Value: 46.62.211.251    TTL: 300
```

Wait 5-30 minutes for DNS propagation.

#### Step 3: SSL Setup
```bash
ssh root@46.62.211.251
chmod +x /root/setup-ssl.sh
/root/setup-ssl.sh
```

#### Step 4: Deploy Backend
```bash
# Upload deployment script
scp deploy-backend.sh root@46.62.211.251:/root/

# SSH and run
ssh root@46.62.211.251
chmod +x /root/deploy-backend.sh
/root/deploy-backend.sh

# Upload backend code
cd packages/backend
npm run build
scp -r package.json package-lock.json dist .env root@46.62.211.251:/opt/enovait/api/

# Deploy
ssh root@46.62.211.251 '/opt/enovait/deploy-api.sh'
```

#### Step 5: Deploy UI
```bash
# Upload deployment script
scp deploy-frontend.sh root@46.62.211.251:/root/

# Build the UI from the workspace root so it uses the repo lockfile
npm run build:ui

# For Coolify, set the build context to the repo root and Dockerfile to packages/ui/Dockerfile
# Coolify will install from the workspace root package-lock.json
```

---

## 📁 Server Structure

```
/opt/enovait/
├── api/                    # Backend application
│   ├── dist/               # Built backend
│   ├── node_modules/       # Dependencies
│   ├── package.json
│   └── .env                # Backend environment variables
├── app/                    # Frontend application
│   ├── dist/               # Built UI files
│   └── .env                # UI environment variables
├── logs/
│   ├── api-access.log
│   ├── api-error.log
│   ├── app-access.log
│   └── app-error.log
├── ssl/
│   ├── api.enov360.com/   # SSL certs for API
│   └── app.enov360.com/   # SSL certs for App
├── deploy-api.sh           # Backend deployment helper
└── deploy-ui.sh            # UI deployment helper
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3000

# Supabase (required)
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
# WHATSAPP_CHANNEL=baileys
# EVOLUTION_API_URL=http://localhost:8080
# EVOLUTION_API_KEY=your-key

# Email (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password
```

### UI (.env)
```env
VITE_API_BASE_URL=https://api.enov360.com/api/v1
```

Note: the UI Dockerfile uses the workspace root `package-lock.json` and `packages/ui/Dockerfile` for reproducible Coolify builds.

---

## 🛠️ Useful Commands

### Check Service Status
```bash
ssh root@46.62.211.251 'systemctl status enovait-api enovait-ui'
```

### View Logs
```bash
# Backend logs
ssh root@46.62.211.251 'tail -f /opt/enovait/logs/api-access.log'

# UI logs
ssh root@46.62.211.251 'tail -f /opt/enovait/logs/app-access.log'
```

### Restart Services
```bash
# Restart backend
ssh root@46.62.211.251 'systemctl restart enovait-api'

# Restart UI
ssh root@46.62.211.251 'systemctl restart enovait-ui'
```

### SSH into Server
```bash
ssh root@46.62.211.251
```

---

## 🔍 Verification

### Check Backend
```bash
curl https://api.enov360.com/health
```

### Check UI
```bash
curl https://app.enov360.com
```

### Check SSL
```bash
curl -I https://api.enov360.com
# Should show: HTTP/2 200 and valid SSL
```

---

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
ssh root@46.62.211.251
journalctl -u enovait-api -n 50 --no-pager
cat /opt/enovait/logs/api-error.log
```

### UI Not Loading?
```bash
ssh root@46.62.211.251
journalctl -u enovait-ui -n 50 --no-pager
ls -la /opt/enovait/app/
```

### Nginx Issues?
```bash
ssh root@46.62.211.251
nginx -t
systemctl status nginx
cat /var/log/nginx/error.log
```

### SSL Certificate Problems?
```bash
ssh root@46.62.211.251
certbot certificates
certbot renew --dry-run
```

---

## 🔄 Updating Deployment

To redeploy after making changes:

```bash
# Quick deploy (builds and uploads everything)
bash deploy-all.sh

# Or deploy just backend
cd packages/backend && npm run build
scp -r dist package.json root@46.62.211.251:/opt/enovait/api/
ssh root@46.62.211.251 'cd /opt/enovait/api && npm install --production && systemctl restart enovait-api'

# Or deploy just UI
cd packages/ui && npm run build
scp -r dist/* root@46.62.211.251:/opt/enovait/app/
ssh root@46.62.211.251 'systemctl restart enovait-ui'
```

---

## 📊 Monitoring

### System Resources
```bash
ssh root@46.62.211.251 'htop'
```

### Disk Usage
```bash
ssh root@46.62.211.251 'df -h'
```

### Nginx Access Logs
```bash
ssh root@46.62.211.251 'tail -f /opt/enovait/logs/api-access.log'
```

---

## 🎯 Next Steps

1. **Set up monitoring**: Install Prometheus + Grafana
2. **Automate deployments**: Set up GitHub Actions to auto-deploy on push to `main`
3. **Backup strategy**: Set up automated database backups
4. **CDN**: Add Cloudflare for caching and DDoS protection
5. **Archon deployment**: Deploy the Archon orchestration layer if using AI agents

---

## 📞 Support

For issues or questions:
- Check logs: `tail -f /opt/enovait/logs/*.log`
- Review systemd journals: `journalctl -u enovait-* -f`
- Test connectivity: `curl -I https://api.enov360.com`
