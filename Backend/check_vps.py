import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.140.81', username='root', password='Hostinger@9992', timeout=15)

# Get ALL logs from the app in the last 5 minutes, not filtered - to see what happens around chat/scan requests
print("=== FULL APP LOGS (last 5 min, unfiltered) ===")
stdin, stdout, stderr = ssh.exec_command('docker logs backend-app-1 --since 5m 2>&1 | grep -E "(chat/sessions|image-analysis|error|Error|warn|fail|timeout|crash|kill|memory|OOM|SIGTERM|prematurely|level.:[45])" | tail -40')
out = stdout.read().decode('utf-8', errors='replace')
print(out)

# Check if the app has memory issues or restarts
print("\n=== CONTAINER RESTARTS ===")
stdin, stdout, stderr = ssh.exec_command('docker inspect backend-app-1 --format "RestartCount: {{.RestartCount}}, OOMKilled: {{.State.OOMKilled}}, ExitCode: {{.State.ExitCode}}"')
print(stdout.read().decode('utf-8', errors='replace'))

# Check Fastify request timeout & connection timeout
print("\n=== CHECK APP TIMEOUT CONFIG ===")
stdin, stdout, stderr = ssh.exec_command('docker exec backend-app-1 grep -n "requestTimeout\|connectionTimeout\|keepAliveTimeout" /app/dist/app.js 2>/dev/null')
print(stdout.read().decode('utf-8', errors='replace'))

# Check docker compose replicas - if 2 replicas, requests may go to wrong container
print("\n=== DOCKER COMPOSE REPLICAS ===")
stdin, stdout, stderr = ssh.exec_command('docker ps --format "{{.Names}}" | grep backend-app')
print(stdout.read().decode('utf-8', errors='replace'))

# Check if there's a second container
print("\n=== ALL CONTAINERS ON PORT 4000 ===")
stdin, stdout, stderr = ssh.exec_command('docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 4000')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
print("=== DONE ===")
