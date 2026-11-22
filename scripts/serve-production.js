#!/usr/bin/env node

/**
 * Production Single-Port Runner for KisanVerify.
 * Builds the frontend once, then serves everything (UI + API)
 * directly from FastAPI on http://localhost:8000.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const isWindows = process.platform === 'win32';

console.log('========================================================');
console.log('🌾 KisanVerify - Single-Port Production Mode (Port 8000)');
console.log('========================================================');

// 1. Build the frontend if missing or stale
console.log('\n[1/3] Building frontend production bundle...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 2. Identify Python executable
let pythonExe = isWindows
  ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
  : path.join(backendDir, '.venv', 'bin', 'python');

if (!fs.existsSync(pythonExe)) {
  pythonExe = isWindows ? 'python' : 'python3';
}

console.log('\n[2/3] Starting FastAPI server on port 8000...');
const uvicornArgs = [
  '-m',
  'uvicorn',
  'app.main:app',
  '--host',
  '0.0.0.0',
  '--port',
  '8000',
  '--app-dir',
  'backend'
];

const serverProcess = spawn(pythonExe, uvicornArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
});

// 3. Poll /health until server responds, then open browser
console.log('\n[3/3] Waiting for server readiness...');

function pollHealth(attempts = 0) {
  if (attempts > 30) {
    console.log('\nServer took longer than expected to start. Please open http://localhost:8000 manually.');
    return;
  }

  const req = http.get('http://127.0.0.1:8000/health', (res) => {
    if (res.statusCode === 200) {
      console.log('\n✅ KisanVerify is live at http://localhost:8000');
      try {
        const openCli = isWindows ? 'cmd /c start http://localhost:8000' : 'open http://localhost:8000';
        execSync(openCli, { stdio: 'ignore' });
      } catch {
        // Fallback or ignore browser launch error
      }
    } else {
      setTimeout(() => pollHealth(attempts + 1), 1000);
    }
  });

  req.on('error', () => {
    setTimeout(() => pollHealth(attempts + 1), 1000);
  });
}

setTimeout(() => pollHealth(), 1500);

serverProcess.on('exit', (code) => {
  process.exit(code || 0);
});
