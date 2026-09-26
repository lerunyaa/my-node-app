const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3002;

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${now}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });

  next();
});

app.use(compression());

const limiter = rateLimit({
  windowMs: 60 * 1000,       // 1 минута
  max: 100,                  // 100 запросов
  message: { error: 'Слишком много запросов, попробуйте позже', status: 429 },
  standardHeaders: true,     // Заголовки RateLimit-*
  legacyHeaders: false,      // Отключить X-RateLimit-*
});
app.use(limiter);

app.get('/', (req, res) => {
  res.json({ message: 'Публичный маршрут' });
});

app.get('/error', (req, res) => {
  throw new Error('Синхронная ошибка сервера');
});

app.get('/async-error', async (req, res, next) => {
  try {
    await Promise.reject(new Error('Асинхронная ошибка сервера'));
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Внутренняя ошибка сервера',
    status
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Тесты:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/error`);
  console.log(`  http://localhost:${PORT}/async-error`);
});