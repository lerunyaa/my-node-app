const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT_HTTP = 3000;
const PORT_HTTPS = 3443;
const GROUP = '401'; 
const CACHE_TIME = 60 * 1000; 
const cache = new Map();

let requestCount = 0;
const statusCount = {};

const middlewares = [];

middlewares.push((req, res, next) => {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${time}] [${GROUP}] ${req.method} ${req.url}`);
  res.setHeader('X-Group', GROUP);
  requestCount++;
  next();
});

middlewares.push((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/stream')) {
    const cached = cache.get(req.url);
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      res.setHeader('X-Cache', 'HIT');
      res.writeHead(cached.status, cached.headers);
      res.end(cached.body);
      return;
    }
  }
  res.setHeader('X-Cache', 'MISS');
  next();
});

const handler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      group: GROUP,
      total: requestCount,
      byStatus: statusCount,
      uptime: process.uptime()
    }, null, 2));
  }

  if (pathname === '/stream') {
    const filePath = path.join(__dirname, 'public/big-file.txt');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end('File not found');
    }
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (pathname.startsWith('/static/')) {
    let fileName = pathname.replace('/static/', '');
    
    if (fileName.includes('..')) {
      res.writeHead(403);
      return res.end('403 Forbidden');
    }

    let filePath = path.join(__dirname, 'public', fileName);
    
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end('404 Not Found');
    }
    
    const stat = fs.statSync(filePath);
    const etag = `"${stat.size}-${stat.mtimeMs}"`;
    
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'max-age=60');

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      return res.end();
    }

    const ext = path.extname(filePath);
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<h1>=== HTTP/HTTPS работает! ===</h1><p>Группа: ${GROUP}</p>`);
  }

  res.writeHead(404);
  res.end('Not Found');
};

const server = http.createServer((req, res) => {
  const originalEnd = res.end.bind(res);
  res.end = (body) => {
    if (!statusCount[res.statusCode]) statusCount[res.statusCode] = 0;
    statusCount[res.statusCode]++;

    if (req.method === 'GET' && !req.url.startsWith('/stream') && res.statusCode === 200 && body) {
      cache.set(req.url, { status: res.statusCode, headers: res.getHeaders(), body, time: Date.now() });
    }
    originalEnd(body);
  };

  let i = 0;
  const next = () => {
    if (i < middlewares.length) {
      middlewares[i++](req, res, next);
    } else {
      handler(req, res);
    }
  };
  next();
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT_HTTP, () => {
  console.log(`[INFO] HTTP-сервер запущен на порту ${PORT_HTTP}`);
  console.log(`[INFO] Группа: ${GROUP}`);
});

if (fs.existsSync('key.pem') && fs.existsSync('cert.pem')) {
  const httpsServer = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>=== HTTPS работает! ===</h1><p>Группа: ${GROUP}</p>`);
  });
  
  httpsServer.listen(PORT_HTTPS, () => {
    console.log(`[INFO] HTTPS-сервер запущен на порту ${PORT_HTTPS}`);
  });
} else {
  console.log('[WARN] Сертификаты key.pem/cert.pem не найдены. HTTPS не запущен.');
}

process.on('SIGINT', () => {
  console.log('\n[INFO] Сервер корректно завершает работу...');
  server.close();
  process.exit(0);
});