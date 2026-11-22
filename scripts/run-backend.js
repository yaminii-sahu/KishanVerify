#!/usr/bin/env node

/**
 * Cross-platform runner for the FastAPI backend.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const isWindows = process.platform === 'win32';

let pythonExe = isWindows
  ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
  : path.join(backendDir, '.venv', 'bin', 'python');

if (!fs.existsSync(pythonExe)) {
  console.warn(`[Backend Runner] Virtual environment not found at ${pythonExe}. Falling back to system python.`);
  pythonExe = isWindows ? 'python' : 'python3';
}

const args = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--app-dir', 'backend', '--reload'];

console.log(`[Backend Runner] Starting: ${pythonExe} ${args.join(' ')}`);

const child = spawn(pythonExe, args, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
