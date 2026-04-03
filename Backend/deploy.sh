#!/bin/bash
cd /var/www/AgritechBot/Backend
git pull
npm install
npm run build
pm2 restart backend
echo "✅ Deployed successfully!"
