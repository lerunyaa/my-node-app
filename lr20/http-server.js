const http = require('http');

const PORT = 3000;
const GROUP = '401';

const server = http.createServer((req, res) => {
  // Получаем текущее время для лога
  const startTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. Запрос GET /
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== Лабораторная работа №20 ===</h1>
      <p>Группа: ${GROUP}</p>
      <p>Метод: ${req.method}</p>
      <p>URL: ${req.url}</p>
    `);
    console.log(`[${startTime}] GET / 200`);
    
  // 2. Запрос GET /about
  } else if (req.method === 'GET' && req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== О студенте ===</h1>
      <p>Группа: ${401}</p>
      <p>Студент: Лера</p>
    `);
    console.log(`[${startTime}] GET /about 200`);
    
  // 3. Запрос к неизвестному пути (404)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>=== 404 Not Found ===</h1>
      <p>Путь ${req.url} не найден</p>
    `);
    console.log(`[${startTime}] GET ${req.url} 404`);
  }
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Открой в браузере: http://localhost:${PORT}/`);
}); 
