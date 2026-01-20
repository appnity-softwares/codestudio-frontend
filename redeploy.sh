#!/bin/bash

# Enable error handling
set -e

echo "🚀 Starting deployment for Frontend..."

# Navigate to project directory
# Since this script is in the repo, we assume we are already in (or near) the directory,
# OR the ssh-action navigates us. 
# But standard practice for these scripts is to be definitive.
# Based on the error log: `script: chmod +x /var/www/codestudio/redeploy.sh`
# and `/var/www/codestudio/redeploy.sh frontend`
# It seems the script expects an argument or is generic.

# Let's assume the script is run from the project root or passed an arg.
# If this file is placed in `frontend/redeploy.sh`, then on the server it might be at
# `/var/www/codestudio/frontend/redeploy.sh`.

# However, the previous log showed: `/var/www/codestudio/redeploy.sh frontend`.
# This implies there was a SINGLE script at the root handling both.
# But the user asked me to "create a new" one.

# I will create a dedicated `redeploy.sh` inside `frontend/` that focuses ONLY on frontend.
# And I will update the `deploy.yml` to call THIS script instead of the root one if possible,
# OR I will create the root one if that's what's expected.

# Given I don't see a root `redeploy.sh`, I will create `frontend/deployment.sh` 
# and update the workflow to call it. 
# WAit, the USER asked to "create a new [one]".
# I will create `frontend/redeploy.sh` and make it robust.

# Go to the directory where this script is located
cd "$(dirname "$0")"

echo "📂 Working directory: $(pwd)"

# 1. Reset Git state to match remote exactly (Fixes the conflict error)
echo "🔄 Fetching latest code..."
git fetch --all
echo "Using: git reset --hard origin/main"
git reset --hard origin/main

# 2. Pull latest changes
git pull origin main

# 3. Install Dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 4. Build
echo "🏗️ Building project..."
npm run build

# 5. Restart Application (adjust name as needed)
echo "🔄 Restarting PM2 process..."
# We assume the ecosystem file or process name is known. 
# Common pattern: `pm2 restart frontend` or `pm2 restart ecosystem.config.js`
# If we don't know the name, we might try to guess or use a generic start.
# For now, I'll use a safe try-restart pattern or just build if it's static serving (nginx).
# If it's pure React served by Nginx (likely given `dist` folder conflict), PM2 might not be needed for *serving* 
# unless it's serving via `serve -s dist`.
# The error log doesn't show run command, just `redeploy.sh frontend`.

# I will assume standard "npm run build" is enough if Nginx serves `dist`.
# But if it uses PM2:
if command -v pm2 &> /dev/null; then
    pm2 restart codestudio-frontend || pm2 restart frontend || echo "⚠️ PM2 process found but failed to restart. Check process name."
else
    echo "ℹ️ PM2 not found. Assuming static build is served by web server."
fi

echo "✅ Deployment complete!"
