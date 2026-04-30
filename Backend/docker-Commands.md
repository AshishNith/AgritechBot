# Docker Commands 

## restart the backend 
docker compose -f docker-compose.prod.yml up -d app

## check logs 
docker compose -f docker-compose.prod.yml logs -f app
