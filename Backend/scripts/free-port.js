const { execSync } = require('node:child_process');

const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT || process.argv[2] || DEFAULT_PORT);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`[prestart] Invalid port: ${port}`);
  process.exit(1);
}

function getListeningPids(targetPort) {
  if (process.platform === 'win32') {
    const output = execSync(`netstat -ano -p tcp | findstr :${targetPort}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && /LISTENING/i.test(line))
      .map((line) => line.split(/\s+/).pop())
      .filter(Boolean)
      .filter((pid) => Number(pid) !== process.pid);
  }

  const output = execSync(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`, {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((pid) => Number(pid) !== process.pid);
}

function killPid(pid) {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: ['ignore', 'ignore', 'ignore'] });
    return;
  }

  process.kill(Number(pid), 'SIGTERM');
}

try {
  const pids = [...new Set(getListeningPids(port))];

  if (pids.length === 0) {
    console.log(`[prestart] Port ${port} is free`);
    process.exit(0);
  }

  console.warn(`[prestart] Port ${port} is in use by PID(s): ${pids.join(', ')}. Terminating...`);
  for (const pid of pids) {
    killPid(pid);
  }

  console.log(`[prestart] Cleared port ${port}`);
} catch {
  // Command can fail when no process is found. Treat as non-blocking for startup.
  console.log(`[prestart] No stale listener found on port ${port}`);
}
