const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const studentRoutes = require('./routes/students');
const pool = require('./models/db');

const app = new Koa();

// Middleware
app.use(bodyParser());
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] [ББМО-01-23] ${ctx.method} ${ctx.url} ${ctx.status} (${ms}ms)`);
});

// Роуты
app.use(studentRoutes.routes());
app.use(studentRoutes.allowedMethods());

const PORT = 3000;
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`[INFO] Пул MySQL создан (лимит: 10)`);
  } catch (e) {
    console.error('[ERROR] Ошибка подключения к БД');
  }
  console.log(`[INFO] Коа-сервер запущен на порту ${PORT}`);
  console.log(`[INFO] Группа: ББМО-01-23`);
}); 
