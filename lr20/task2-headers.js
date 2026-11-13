const http = require('http');

const PORT = 3000;
const GROUP = '401'; 

const server = http.createServer((req, res) => {
  res.setHeader('X-Powered-By', 'Node.js');
  res.setHeader('X-Group', GROUP);
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'GET' && req.url === '/headers') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    }, null, 2));
  } 
  
  else if (req.method === 'GET' && req.url === '/headers/set') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Заголовки установлены</h1>
      <p>Проверьте их через <code>curl -I</code> или DevTools (F12 → Network).</p>
    `);
  } 
  
  else if (req.method === 'GET' && req.url === '/headers/check') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      hasContentType: res.hasHeader('Content-Type'),
      hasXGroup: res.hasHeader('X-Group'),
      hasUnknown: res.hasHeader('X-Unknown')
    }, null, 2));
  } 
  
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Сервер на порту ${PORT}`);
});