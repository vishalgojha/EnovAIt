#!/bin/bash
set -e

echo "========================================="
echo "EnovAIt Full Deployment Script"
echo "========================================="
echo "This script deploys both backend and UI"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting full deployment...${NC}"
echo ""

# Step 1: Build backend locally
echo "[1/8] Building backend locally..."
cd packages/backend
npm run build
cd ../..
echo -e "${GREEN}✅ Backend built${NC}"

# Step 2: Build UI locally
echo "[2/8] Building UI locally..."
cd packages/ui
npm run build
cd ../..
echo -e "${GREEN}✅ UI built${NC}"

# Step 3: Upload backend
echo "[3/8] Uploading backend to server..."
ssh root@46.62.211.251 "mkdir -p /opt/enovait/api"
scp -r packages/backend/package.json packages/backend/package-lock.json root@46.62.211.251:/opt/enovait/api/
scp -r packages/backend/dist root@46.62.211.251:/opt/enovait/api/
scp -r packages/backend/src root@46.62.211.251:/opt/enovait/api/src 2>/dev/null || true
echo -e "${GREEN}✅ Backend uploaded${NC}"

# Step 4: Upload UI
echo "[4/8] Uploading UI to server..."
ssh root@46.62.211.251 "mkdir -p /opt/enovait/app"
scp -r packages/ui/dist/* root@46.62.211.251:/opt/enovait/app/
echo -e "${GREEN}✅ UI uploaded${NC}"

# Step 5: Upload environment files
echo "[5/8] Checking environment files..."
if [ -f packages/backend/.env ]; then
    scp packages/backend/.env root@46.62.211.251:/opt/enovait/api/.env
    echo -e "${GREEN}✅ Backend .env uploaded${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env not found. You'll need to create it manually on the server.${NC}"
fi

if [ -f packages/ui/.env ]; then
    scp packages/ui/.env root@46.62.211.251:/opt/enovait/app/.env
    echo -e "${GREEN}✅ UI .env uploaded${NC}"
else
    echo -e "${YELLOW}⚠️  UI .env not found. Creating default...${NC}"
    echo "VITE_API_BASE_URL=https://api.enov360.com/api/v1" | ssh root@46.62.211.251 "cat > /opt/enovait/app/.env"
fi

# Step 6: Deploy backend
echo "[6/8] Deploying backend..."
ssh root@46.62.211.251 << 'SSH_EOF'
cd /opt/enovait/api
npm install --production
systemctl restart enovait-api
sleep 2
systemctl is-active enovait-api
SSH_EOF
echo -e "${GREEN}✅ Backend deployed and started${NC}"

# Step 7: Deploy UI
echo "[7/8] Deploying UI..."
ssh root@46.62.211.251 << 'SSH_EOF'
# UI is served by Caddy from /opt/enovait/app
echo "UI files uploaded to /opt/enovait/app"
SSH_EOF
echo -e "${GREEN}✅ UI deployed${NC}"

# Step 8: Verify deployment
echo "[8/8] Verifying deployment..."
sleep 3
echo ""
echo "Testing backend..."
HTTP_CODE_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://46.62.211.251/api/v1/health || echo "failed")
echo "  Backend API (http://46.62.211.251/api/v1/health): HTTP $HTTP_CODE_BACKEND"

echo ""
echo "Testing UI..."
HTTP_CODE_UI=$(curl -s -o /dev/null -w "%{http_code}" http://46.62.211.251/ || echo "failed")
echo "  UI (http://46.62.211.251/): HTTP $HTTP_CODE_UI"

echo ""
echo "========================================="
echo -e "${GREEN}✅ Full deployment complete!${NC}"
echo "========================================="
echo ""
echo "Your services:"
echo "  UI:       http://46.62.211.251"
echo "  API:      http://46.62.211.251/api/*"
echo ""
echo "Useful commands:"
echo "  View logs:        ssh root@46.62.211.251 'tail -f /opt/enovait/logs/api-access.log'"
echo "  Restart backend:  ssh root@46.62.211.251 'systemctl restart enovait-api'"
echo "  Restart Caddy:    ssh root@46.62.211.251 'systemctl restart caddy'"
echo "  Check status:     ssh root@46.62.211.251 'systemctl status enovait-api caddy'"
echo ""
