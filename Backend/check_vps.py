import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.140.81', username='root', password='Hostinger@9992', timeout=15)

BACKEND_DIR = '/root/AgritechBot/Backend'

# Step 1: Git pull latest code
print("=== Step 1: Git pull ===")
stdin, stdout, stderr = ssh.exec_command(f'cd {BACKEND_DIR} && git pull 2>&1')
out = stdout.read().decode('utf-8', errors='replace')
print(out)

# Step 2: Verify our changes are in the source
print("=== Step 2: Verify source code has our changes ===")
stdin, stdout, stderr = ssh.exec_command(f'cd {BACKEND_DIR} && grep -c "20_000" src/chat/services/geminiChat.service.ts 2>/dev/null')
out = stdout.read().decode('utf-8', errors='replace').strip()
print(f"GEMINI_API_TIMEOUT 20s found: {out}")

stdin, stdout, stderr = ssh.exec_command(f'cd {BACKEND_DIR} && grep -c "Re-throw intentional" src/middlewares/usageEnforcement.middleware.ts 2>/dev/null')
out = stdout.read().decode('utf-8', errors='replace').strip()
print(f"Usage middleware fix found: {out}")

stdin, stdout, stderr = ssh.exec_command(f'cd {BACKEND_DIR} && grep "GEMINI_API_TIMEOUT_MS" src/chat/services/geminiChat.service.ts 2>/dev/null')
out = stdout.read().decode('utf-8', errors='replace').strip()
print(f"Actual timeout line: {out}")

ssh.close()
print("\n=== DONE ===")
