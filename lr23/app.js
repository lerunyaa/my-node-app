const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./config/db');
const studentRoutes = require('./routes/students');

const app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] [ББМО-01-23] ${ctx.method} ${ctx.url} ${ctx.status} (${ms}ms)`);
});

app.use(studentRoutes.routes());
app.use(studentRoutes.allowedMethods());

const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[INFO] Коа-сервер запущен на порту ${PORT}`);
    console.log(`[INFO] Группа: ББМО-01-23`);
  });
}); 
