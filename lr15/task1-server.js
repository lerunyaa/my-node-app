const Koa = require('koa');

const app = new Koa();
const PORT = 3000;
const GROUP = '401';
app.use(async (ctx) => {
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU');

  ctx.type = 'text/html; charset=utf-8';
  ctx.body = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>ЛР №15</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #2c3e50; }
        .info { background: #ecf0f1; padding: 20px; border-radius: 8px; }
        .info p { margin: 10px 0; font-size: 18px; }
      </style>
    </head>
    <body>
      <h1>Лабораторная работа №15</h1>
      <div class="info">
        <p><strong>Группа:</strong> ${GROUP}</p>
        <p><strong>Дата и время:</strong> ${dateStr}</p>
        <p><strong>Приветствие:</strong> Добро пожаловать на сервер Koa.js!</p>
      </div>
    </body>
    </html>
  `;
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});