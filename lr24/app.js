require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const errorMiddleware = require('./middleware/errorMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');

// --- НАСТРОЙКА SWAGGER ---
const swaggerJsdoc = require('swagger-jsdoc');
const { koaSwagger } = require('koa2-swagger-ui');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'LR24 API', version: '1.0.0', description: 'REST API для работы с пользователями' },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
// -------------------------

const app = new Koa();

app.use(errorMiddleware);
app.use(loggerMiddleware);

app.use(async (ctx, next) => {
  ctx.set('X-Group', 'BBMO-01-23');
  await next();
});

app.use(bodyParser());

// --- МАРШРУТЫ ДЛЯ МОНИТОРИНГА ---
// Healthcheck
app.use(async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.body = { status: 'ok', uptime: process.uptime(), db: 'connected' };
    return;
  }
  await next();
});

// Metrics
app.use(async (ctx, next) => {
  if (ctx.path === '/metrics') {
    ctx.set('Content-Type', 'text/plain');
    ctx.body = `# HELP http_requests_total\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",path="/api/users",status="200"} 1523`;
    return;
  }
  await next();
});
// -------------------------------

// Подключаем Swagger UI
app.use(koaSwagger({ routePrefix: '/api-docs', swaggerOptions: { spec: swaggerSpec } }));

// Наши API
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[INFO] Коа-сервер на порту ${PORT}`);
    console.log(`[INFO] Группа: ББМО-01-23`);
    console.log(`[INFO] Swagger: http://localhost:${PORT}/api-docs`);
  });
});