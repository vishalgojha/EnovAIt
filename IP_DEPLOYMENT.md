# EnovAIt IP-Based Deployment

## 🚀 Quick Deploy

### Step 1: Server Setup

Upload and run the server setup script:

```bash
# From C:\Users\visha\EnovAIt (use Git Bash or WSL)
scp server-setup-servebyte.sh root@46.62.211.251:/root/
ssh root@46.62.211.251 "chmod +x /root/server-setup-servebyte.sh && /root/server-setup-servebyte.sh"
```

### Step 2: Deploy Application

```bash
# Deploy everything
bash deploy-all.sh
```

That's it! Your app will be running at:
- **UI**: http://46.62.211.251
- **API**: http://46.62.211.251/api/*

---

## 📋 Manual Deployment

### Server Setup
```bash
ssh root@46.62.211.251
chmod +x /root/server-setup-servebyte.sh
/root/server-setup-servebyte.sh
```

### Build & Upload Backend
```bash
# Build locally
cd packages/backend
npm run build

# Upload to server
scp package.json package-lock.json dist root@46.62.211.251:/opt/enovait/api/

# If you have .env file
scp .env root@46.62.211.251:/opt/enovait/api/
```

### Build & Upload UI
```bash
# Build locally
cd packages/ui
npm run build

# Upload to server
scp -r dist/* root@46.62.211.251:/opt/enovait/app/
```

### Start Backend
```bash
ssh root@46.62.211.251
cd /opt/enovait/api
npm install --production
systemctl start enovait-api
systemctl status enovait-api
```

---

## 🔧 Environment Variables

Create `/opt/enovait/api/.env` on the server:

```env
NODE_ENV=production
PORT=3000

# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# AI Providers (at least one)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
```

---

## 🛠️ Useful Commands

```bash
# Check status
ssh root@46.62.211.251 "systemctl status enovait-api caddy"

# View logs
ssh root@46.62.211.251 "tail -f /opt/enovait/logs/api-access.log"

# Restart backend
ssh root@46.62.211.251 "systemctl restart enovait-api"

# Restart Caddy
ssh root@46.62.211.251 "systemctl restart caddy"

# Check Caddy logs
ssh root@46.62.211.251 "journalctl -u caddy -n 50 --no-pager"
```

---

## 📁 Server Structure

```
/opt/enovait/
├── api/                    # Backend (Node.js)
│   ├── dist/               # Built backend
│   ├── node_modules/
│   ├── package.json
│   └── .env
├── app/                    # Frontend (static files)
│   └── index.html, assets...
└── logs/
    ├── api-access.log
    └── api-error.log
```

---

## 🌐 Routing

- `http://46.62.211.251/` → Serves UI from `/opt/enovait/app`
- `http://46.62.211.251/api/*` → Proxies to backend on port 3000
- `http://46.62.211.251/ws/*` → WebSocket proxy to backend
- `http://46.62.211.251/api/v1/health` → Backend health check endpoint

## Notes

- The server setup script installs Caddy from the official Debian/Ubuntu package repository and writes `/etc/caddy/Caddyfile`.
- Caddy serves the UI from `/opt/enovait/app` and reverse-proxies `/api/*` and `/ws/*` to `127.0.0.1:3000`.
- Caddy service logs are available via `journalctl -u caddy`.
