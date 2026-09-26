const express = require('express');

const app = express();
const PORT = 3000;
const GROUP = '401';
const style = `
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #2c3e50; }
    .card { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    ul { line-height: 1.8; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .label { color: #7f8c8d; font-size: 14px; }
  </style>
`;

app.get('/', (req, res) => {
  const now = new Date().toLocaleString('ru-RU');
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>ЛР №16</title>${style}</head>
    <body>
      <div class="card">
        <h1>Лабораторная работа №16</h1>
        <p class="label">Express.js — сервер</p>
        <hr>
        <p><strong>Группа:</strong> ${GROUP}</p>
        <p><strong>Дата и время:</strong> ${now}</p>
        <p><strong>Приветствие:</strong> Добро пожаловать на сервер Express.js!</p>
        <hr>
        <h3>Доступные маршруты:</h3>
        <ul>
          <li><a href="/">/</a> — главная страница</li>
          <li><a href="/about">/about</a> — о разработчике</li>
          <li><a href="/contacts">/contacts</a> — контакты</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>О разработчике</title>${style}</head>
    <body>
      <div class="card">
        <h1>О разработчике</h1>
        <hr>
        <p><strong>Студент:</strong> Какулина Валерия</p>
        <p><strong>Группа:</strong> ${GROUP}</p>
        <p><strong>Лабораторная:</strong> №16 — Express.js</p>
        <p><strong>Год:</strong> 2026</p>
        <p><a href="/">← На главную</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/contacts', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head><meta charset="UTF-8"><title>Контакты</title>${style}</head>
    <body>
      <div class="card">
        <h1>Контакты</h1>
        <hr>
        <p><strong>Email:</strong> lerunyaa@example.com</p>
        <p><strong>GitHub:</strong> <a href="https://github.com/lerunyaa">github.com/lerunyaa</a></p>
        <p><strong>Telegram:</strong> @lerunyaa</p>
        <p><a href="/">← На главную</a></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});