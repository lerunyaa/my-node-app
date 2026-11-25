const http = require('http');
const PORT = 3002; 
const GROUP = '401';
const MAX_SIZE = 1024 * 1024; 

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'POST' && req.url === '/echo') {
    let body = '';
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('413 Payload Too Large');
        req.destroy(); 
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      if (size > MAX_SIZE) return; 
      console.log(`[LOG] Получено тело размером: ${size} байт`);
      res.setHeader('X-Group', GROUP);

      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(body);
          parsed.group = GROUP; // Добавляем поле группы
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(parsed, null, 2));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid JSON');
        }
      } else {
        // Для text/plain или других
        res.writeHead(200, { 'Content-Type': contentType || 'text/plain; charset=utf-8' });
        res.end(body);
      }
    });

    req.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
    });
  } 
  // Обработка POST /form (form-urlencoded)
  else if (req.method === 'POST' && req.url === '/form') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      // Парсим строку "name=Иван&group=ББМО-01-23" в объект
      const params = new URLSearchParams(body);
      const result = {};
      for (const [key, value] of params) {
        result[key] = value;
      }
      result.group = GROUP;
      
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Group': GROUP });
      res.end(JSON.stringify(result, null, 2));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});