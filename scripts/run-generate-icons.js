const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const venvPythonWin = path.join(rootDir, 'backend', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(rootDir, 'backend', '.venv', 'bin', 'python');

let pythonBin = 'python';
if (fs.existsSync(venvPythonWin)) {
  pythonBin = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonBin = venvPythonUnix;
}

const scriptPath = path.join(__dirname, 'generate_icons.py');
console.log(`Running icon generator with ${pythonBin}...`);

const res = spawnSync(pythonBin, [scriptPath], {
  stdio: 'inherit',
  cwd: rootDir
});

process.exit(res.status || 0);
