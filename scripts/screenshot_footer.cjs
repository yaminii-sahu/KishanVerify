const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.resolve(__dirname, '../frontend/dist');
const PORT = 5188;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(DIST_DIR, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const outDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const viewports = [
    { width: 360, height: 900, name: 'footer-360px.png' },
    { width: 768, height: 900, name: 'footer-768px.png' },
    { width: 1024, height: 900, name: 'footer-1024px.png' },
    { width: 1440, height: 900, name: 'footer-1440px.png' },
  ];

  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'networkidle0' });

      // Scroll to footer
      await page.evaluate(() => {
        const footer = document.querySelector('footer');
        if (footer) footer.scrollIntoView();
      });

      // Small pause for transitions
      await new Promise((r) => setTimeout(r, 400));

      const outFile = path.join(outDir, vp.name);
      await page.screenshot({ path: outFile });
      console.log(`Captured ${vp.name} (${vp.width}x${vp.height}) -> ${outFile}`);
      await page.close();
    }

    // Also capture full farmer home footer on 360px to confirm mobile bottom tab bar doesn't overlap
    const homePage = await browser.newPage();
    await homePage.setViewport({ width: 360, height: 800 });
    await homePage.goto(`http://localhost:${PORT}/farmer`, { waitUntil: 'networkidle0' });
    await homePage.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    const mobileHomeFile = path.join(outDir, 'footer-mobile-home-360px.png');
    await homePage.screenshot({ path: mobileHomeFile });
    console.log(`Captured footer-mobile-home-360px.png -> ${mobileHomeFile}`);
    await homePage.close();

    await browser.close();
    console.log('All screenshots completed successfully!');
  } catch (err) {
    console.error('Puppeteer screenshot error:', err);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
