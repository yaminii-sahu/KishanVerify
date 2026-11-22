#!/usr/bin/env node

/**
 * Cross-platform setup script for KisanVerify.
 * Works seamlessly across Windows (PowerShell/CMD), macOS, and Linux.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const isWindows = process.platform === 'win32';

function run(command, cwd = rootDir) {
  console.log(`\n> [KisanVerify Setup] ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

console.log('========================================================');
console.log('🌾 KisanVerify Automated Cross-Platform Setup');
console.log('========================================================');

// 1. Copy .env.example to .env if missing
const envFile = path.join(rootDir, '.env');
const envExample = path.join(rootDir, '.env.example');
if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
  console.log('Creating default .env from .env.example...');
  fs.copyFileSync(envExample, envFile);
}

// 2. Setup Python Virtual Environment in backend/.venv
const venvDir = path.join(backendDir, '.venv');
const pythonVenvExe = isWindows
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python');

if (!fs.existsSync(pythonVenvExe)) {
  console.log('\nCreating Python virtual environment in backend/.venv...');
  try {
    run('python -m venv .venv', backendDir);
  } catch {
    console.log('Trying python3...');
    run('python3 -m venv .venv', backendDir);
  }
} else {
  console.log('\nPython virtual environment already exists.');
}

// 3. Install backend requirements
const pipExe = isWindows
  ? path.join(venvDir, 'Scripts', 'pip.exe')
  : path.join(venvDir, 'bin', 'pip');

console.log('\nInstalling backend Python requirements...');
run(`"${pipExe}" install -r requirements.txt`, backendDir);

// 4. Install frontend npm dependencies
console.log('\nInstalling frontend Node dependencies...');
run('npm install', frontendDir);

// 5. Install root dependencies if missing
const rootNodeModules = path.join(rootDir, 'node_modules');
if (!fs.existsSync(rootNodeModules)) {
  console.log('\nInstalling root runner dependencies (concurrently, wait-on, open-cli)...');
  run('npm install', rootDir);
}

console.log('\n========================================================');
console.log('✅ KisanVerify setup complete!');
console.log('Run "npm start" to launch frontend, backend, and browser.');
console.log('========================================================\n');
