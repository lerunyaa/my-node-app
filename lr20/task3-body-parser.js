const http = require('http');

const PORT = 3000;
const GROUP = '401'; 
const MAX_BODY_SIZE = 1024 * 1024; 

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'POST' && (pathname === '/echo' || pathname === '/form')) {
    let body = '';
    let size = 0;
    let isTooLarge = false;

    req.on('data', chunk => {
      if (isTooLarge) return; // Если уже превысили, игнорируем
      
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        isTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('413 Payload Too Large');
        req.destroy(); // Прерываем соединение
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      if (isTooLarge) return;

      console.log(`[LOG] Получено тело размером: ${size} байт`);

      if (pathname === '/echo') {
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          try {
            const json = JSON.parse(body);
            json.group = GROUP; // Эхо-сервер добавляет группу
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(json, null, 2));
          } catch (e) {
            res.writeHead(400);
            res.end('Invalid JSON');
          }
        } else {
          // Для text/plain и остальных
          res.writeHead(200, { 'Content-Type': contentType || 'text/plain; charset=utf-8' });
          res.end(body);
        }
      } 
      
      else if (pathname === '/form') {
        const params = new URLSearchParams(body);
        const result = {};
        for (const [key, value] of params) {
          result[key] = value;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result, null, 2));
      }
    });

    req.on('error', (err) => {
      console.error('[ERROR]', err.message);
      res.writeHead(500);
      res.end('Internal Server Error');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Сервер на порту ${PORT}`);
});