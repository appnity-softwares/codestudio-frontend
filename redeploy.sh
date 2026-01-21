#!/bin/bash
# CodeStudio Granular Redeploy Script
# Usage: ./redeploy.sh [backend|frontend|all]

set -e

INSTALL_DIR="/var/www/codestudio"
cd $INSTALL_DIR

MODE=${1:-"all"}

echo "------------------------------------------------"
echo "🔄 Starting Redeploy: $MODE"
echo "------------------------------------------------"

if [[ "$MODE" == "backend" || "$MODE" == "all" ]]; then
    echo "📦 Updating Backend..."
    cd $INSTALL_DIR/backend
    
    # 1. Pull latest code
    echo "⬇️ Pulling from GitHub..."
    git pull origin main
    
    # 2. Delete existing build (Cleanup)
    echo "🗑️ Deleting old backend binary..."
    rm -f server
    
    # 3. Rebuild
    echo "🏗️ Building backend binary..."
    /usr/local/go/bin/go mod tidy
    /usr/local/go/bin/go build -o server ./cmd/server/main.go
    
    # 4. Restart service
    echo "🔄 Restarting Service..."
    # Seeding is intentionally omitted as per requirements
    sudo systemctl restart codestudio-api
    echo "✅ Backend Updated & Restarted"
fi

if [[ "$MODE" == "frontend" || "$MODE" == "all" ]]; then
    echo "🏗️ Updating Frontend..."
    cd $INSTALL_DIR/frontend
    
    # 1. Pull latest code
    echo "⬇️ Pulling from GitHub..."
    git pull origin main
    
    # 2. Delete existing build (Cleanup)
    echo "🗑️ Deleting old frontend dist folder..."
    rm -rf dist
    
    # 3. Rebuild
    echo "📦 Installing dependencies and building..."
    npm install --legacy-peer-deps
    npm run build
    
    # No restart needed for Nginx as it serves the dist folder
    echo "✅ Frontend Updated & Rebuilt"
fi

echo "------------------------------------------------"
echo "✨ Redeploy Complete!"
echo "------------------------------------------------"
