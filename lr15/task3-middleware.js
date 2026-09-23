const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();
const PORT = 3002;

app.use(async (ctx, next) => {
  const start = Date.now();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  await next();

  const ms = Date.now() - start;
  console.log(`[${now}] ${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Внутренняя ошибка сервера',
      status: ctx.status
    };
    ctx.app.emit('error', err, ctx);
  }
});

async function authMiddleware(ctx, next) {
  const token = ctx.headers['authorization'];
  if (!token) {
    ctx.status = 401;
    ctx.body = {
      error: 'Требуется авторизация (заголовок Authorization)',
      status: 401
    };
    return;
  }
  await next();
}

router.get('/', (ctx) => {
  ctx.body = { message: 'Публичный маршрут' };
});

router.get('/protected', authMiddleware, (ctx) => {
  ctx.body = {
    message: 'Доступ разрешён',
    token: ctx.headers['authorization']
  };
});

router.get('/error', (ctx) => {
  throw new Error('Внутренняя ошибка сервера');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Тесты:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/error`);
  console.log(`  http://localhost:${PORT}/protected`);
});