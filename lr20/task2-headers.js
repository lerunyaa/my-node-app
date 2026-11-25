const http = require('http');
const PORT = 3001; 
const GROUP = '401';

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Добавляем поддержку HEAD запросов для curl -I
  const isGetOrHead = (req.method === 'GET' || req.method === 'HEAD');

  if (isGetOrHead && req.url === '/headers') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', GROUP);
    res.writeHead(200);
    if (req.method !== 'HEAD') {
      res.end(JSON.stringify({ headers: req.headers, method: req.method, url: req.url }, null, 2));
    } else {
      res.end();
    }
  } 
  else if (isGetOrHead && req.url === '/headers/set') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', GROUP);
    res.setHeader('Cache-Control', 'no-cache');
    res.writeHead(200);
    if (req.method !== 'HEAD') {
      res.end('<h1>Custom Headers Set!</h1>'); 
    } else {
      res.end();
    }
  }
  else if (isGetOrHead && req.url === '/headers/check') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Group', GROUP);
    res.writeHead(200);
    if (req.method !== 'HEAD') {
      res.end(JSON.stringify({ 
        hasContentType: res.hasHeader('Content-Type'), 
        hasXGroup: res.hasHeader('X-Group'), 
        hasUnknown: res.hasHeader('X-Unknown') 
      }, null, 2));
    } else {
      res.end();
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});