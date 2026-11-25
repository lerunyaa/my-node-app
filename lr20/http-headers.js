const http = require('http');

const PORT = 3000;
const GROUP = 'ББМО-01-23';

const server = http.createServer((req, res) => {
  // 1. GET /headers
  if (req.url === '/headers') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    }, null, 2));
    console.log(`GET /headers 200`);
  
  // 2. GET /headers/set
  } else if (req.url === '/headers/set') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', 'BBMO-01-23'); // латиница, чтобы избежать ошибки
    res.setHeader('Cache-Control', 'no-cache');
    
    res.writeHead(200);
    res.end('<h1>Заголовки установлены!</h1>');
    console.log(`GET /headers/set 200`);
  
  // 3. GET /headers/check
  } else if (req.url === '/headers/check') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      hasContentType: req.headers.hasOwnProperty('content-type'),
      hasXGroup: req.headers.hasOwnProperty('x-group'),
      hasUnknown: req.headers.hasOwnProperty('x-unknown-header')
    }, null, 2));
    console.log(`GET /headers/check 200`);
    
  // 4. 404
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    console.log(`GET ${req.url} 404`);
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});