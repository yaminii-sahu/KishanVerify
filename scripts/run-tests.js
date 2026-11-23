#!/usr/bin/env node

/**
 * Cross-platform test runner for KisanVerify.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const isWindows = process.platform === 'win32';

let pythonExe = isWindows
  ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
  : path.join(backendDir, '.venv', 'bin', 'python');

if (!fs.existsSync(pythonExe)) {
  pythonExe = isWindows ? 'python' : 'python3';
}

const args = ['-m', 'pytest', 'backend/tests', ...process.argv.slice(2)];

const result = spawnSync(pythonExe, args, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWindows,
});

process.exit(result.status ?? 0);
