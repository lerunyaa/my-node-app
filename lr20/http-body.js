const http = require('http');

const PORT = 3000;
const GROUP = 'ББМО-01-23';
const MAX_BODY_SIZE = 1024 * 1024; // 1 МБ

const server = http.createServer((req, res) => {
  // Обработка POST /echo
  if (req.method === 'POST' && req.url === '/echo') {
    let body = '';
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      // Защита от переполнения
      if (size > MAX_BODY_SIZE) {
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('413 Payload Too Large');
        req.destroy(); // Обрываем соединение
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log(`[LOG] Получено тело размером: ${size} байт. Content-Type: ${req.headers['content-type']}`);
      
      // Если прислали JSON
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        try {
          const parsed = JSON.parse(body);
          parsed.group = GROUP; // Добавляем группу
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(parsed, null, 2));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('400 Bad Request: Invalid JSON');
        }
      } 
      // Если прислали текст
      else if (req.headers['content-type'] && req.headers['content-type'].includes('text/plain')) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(body);
      } 
      // Всё остальное
      else {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Получено: ' + body);
      }
    });

    req.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
    });

  // Обработка POST /form
  } else if (req.method === 'POST' && req.url === '/form') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      // Парсим form-data (name=Иван&group=ББМО)
      const params = new URLSearchParams(body);
      const data = Object.fromEntries(params.entries());
      
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data, null, 2));
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 
