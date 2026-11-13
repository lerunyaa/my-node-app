const http = require('http');

const PORT = 3000;
const GROUP = '401';
const STUDENT = 'Какулина Валерия';
const server = http.createServer((req, res) => {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  
  const logRequest = (status) => {
    console.log(`[${time}] ${req.method} ${req.url} ${status}`);
  };

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== Лабораторная работа №20 ===</h1>
      <p>Группа: ${GROUP}</p>
      <p>Метод: ${req.method}</p>
      <p>URL: ${req.url}</p>
    `);
    logRequest(200);
  } else if (req.method === 'GET' && req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== О студенте ===</h1>
      <p>Группа: ${GROUP}</p>
      <p>Студент: ${STUDENT}</p>
    `);
    logRequest(200);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== 404 Not Found ===</h1>
      <p>Путь ${req.url} не найден</p>
    `);
    logRequest(404);
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});