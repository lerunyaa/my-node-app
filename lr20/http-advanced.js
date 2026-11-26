const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const GROUP = 'BBMO-01-23';

// Метрики
let metrics = {
  total: 0,
  byMethod: {},
  byStatus: {},
  startTime: Date.now()
};

// Middleware
const middlewares = [
  (req, res, next) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${time}] [${GROUP}] ${req.method} ${req.url}`);
    metrics.total++;
    metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;
    res.setHeader('X-Group', GROUP);
    next();
  },
  (req, res, next) => {
    setTimeout(next, 10); // Имитация задержки
  }
];

const cache = new Map();
const CACHE_TTL = 60000; // 60 секунд

const server = http.createServer((req, res) => {
  const runMiddleware = (index) => {
    if (index === middlewares.length) {
      handleRequest(req, res);
    } else {
      middlewares[index](req, res, () => runMiddleware(index + 1));
    }
  };
  runMiddleware(0);
});

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Метрики
  if (pathname === '/metrics') {
    metrics.byStatus[200] = (metrics.byStatus[200] || 0) + 1;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      group: GROUP,
      total: metrics.total,
      byMethod: metrics.byMethod,
      byStatus: metrics.byStatus,
      uptime: Math.floor((Date.now() - metrics.startTime) / 1000)
    }, null, 2));
    return;
  }

  // 2. Статика
  if (pathname.startsWith('/static/')) {
    const fileName = pathname.replace('/static/', '');
    const filePath = path.join(__dirname, 'public', fileName);
    const publicDir = path.join(__dirname, 'public');

    // Защита от path traversal
    if (!filePath.startsWith(publicDir)) {
      metrics.byStatus[403] = (metrics.byStatus[403] || 0) + 1;
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    // Проверка кэша
    if (cache.has(fileName)) {
      const cached = cache.get(fileName);
      if (Date.now() - cached.time < CACHE_TTL) {
        metrics.byStatus[200] = (metrics.byStatus[200] || 0) + 1;
        res.writeHead(200, { 
          'Content-Type': cached.mime,
          'Cache-Control': 'max-age=60',
          'ETag': cached.etag
        });
        res.end(cached.data);
        return;
      }
    }

    // Отдача файла с диска
    fs.readFile(filePath, (err, data) => {
      if (err) {
        metrics.byStatus[404] = (metrics.byStatus[404] || 0) + 1;
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath);
      let mime = 'text/plain';
      if (ext === '.html') mime = 'text/html';
      if (ext === '.css') mime = 'text/css';

      const etag = '"' + data.length + '"';
      cache.set(fileName, { data, mime, etag, time: Date.now() });

      metrics.byStatus[200] = (metrics.byStatus[200] || 0) + 1;
      res.writeHead(200, { 
        'Content-Type': mime,
        'Cache-Control': 'max-age=60',
        'ETag': etag
      });
      res.end(data);
    });
    return;
  }

  // 3. Стриминг
  if (pathname === '/stream') {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    const stream = fs.createReadStream(path.join(__dirname, 'public', 'index.html'));
    stream.pipe(res);
    metrics.byStatus[200] = (metrics.byStatus[200] || 0) + 1;
    return;
  }

  // 4. Главная
  if (pathname === '/') {
    metrics.byStatus[200] = (metrics.byStatus[200] || 0) + 1;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>HTTP Advanced Server</h1>');
    return;
  }

  // 5. 404
  metrics.byStatus[404] = (metrics.byStatus[404] || 0) + 1;
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

server.listen(PORT, () => {
  console.log(`[INFO] HTTP-сервер запущен на порту ${PORT}`);
  console.log(`[INFO] Группа: ${GROUP}`);
}); 
