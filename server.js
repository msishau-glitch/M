const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/website.html' : req.url;
  const resolvedPath = path.normalize(path.join(rootDir, urlPath));

  if (!resolvedPath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, hostname, () => {
  const hostLabel = hostname === '0.0.0.0' ? 'localhost' : hostname;
  console.log(`Wedding invitation server running at http://${hostLabel}:${port}`);
  console.log(`Network share: http://<your-computer-ip>:${port}`);
});
