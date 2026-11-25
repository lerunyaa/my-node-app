const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3004;
const GROUP = '401';

// Метрики
let metrics = {
  total: 0,
  byMethod: {},
  byStatus: {}
};

// Логирование в файл
const logStream = fs.createWriteStream('access.log', { flags: 'a' });
function logRequest(method, url, status) {
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logLine = `[${time}] [${GROUP}] ${method} ${url} ${status}\n`;
  logStream.write(logLine);
  console.log(logLine.trim());
  
  metrics.total++;
  metrics.byMethod[method] = (metrics.byMethod[method] || 0) + 1;
  metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;
}

// MIME-типы
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const method = req.method;
  
  // Защита от Path Traversal — проверяем СЫРОЙ URL до парсинга
  if (req.url.includes('..')) {
    res.setHeader('X-Group', GROUP);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    logRequest(method, req.url, 403);
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Устанавливаем заголовок группы для всех ответов
  res.setHeader('X-Group', GROUP);

  // Обработка статики
  if (pathname.startsWith('/static/')) {
    const fileName = pathname.replace('/static/', '');
    const filePath = path.join(__dirname, 'public', fileName);
    
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return logRequest(method, req.url, 404);
      }

      // Кэширование (ETag)
      const etag = `"${stats.size}-${stats.mtimeMs}"`;
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'max-age=60');

      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304);
        res.end();
        return logRequest(method, req.url, 304);
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      logRequest(method, req.url, 200);
    });
  }
  // Метрики
  else if (pathname === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ group: GROUP, ...metrics }, null, 2));
    logRequest(method, req.url, 200);
  }
  // Корневой путь
  else if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>Group: ${GROUP}</h1><p>Try /static/index.html or /metrics</p>`);
    logRequest(method, req.url, 200);
  }
  // 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    logRequest(method, req.url, 404);
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Group: ${GROUP}`);
});