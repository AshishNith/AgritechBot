# Docker Commands 

## restart the backend 
docker compose -f docker-compose.prod.yml up -d app

## check logs 
docker compose -f docker-compose.prod.yml logs -f app

## Deploy the latest commit 
DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ") docker compose -f docker-compose.prod.yml up -d --build app

## Kill the port  
sudo lsof -i :4000
kill -9 <PID>

## Bring down the old containers and free up the network ports
docker compose -f docker-compose.prod.yml down

ssh root@187.127.140.81