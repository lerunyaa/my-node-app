const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3004;
const JWT_SECRET = 'lr16-secret-key';

app.use(express.json());

const TITLES = ['Война и мир', 'Преступление и наказание', 'Мастер и Маргарита', '1984', 'Гарри Поттер', 'Анна Каренина', 'Отцы и дети', 'Тихий Дон', 'Мёртвые души', 'Евгений Онегин'];
const AUTHORS = ['Толстой', 'Достоевский', 'Булгаков', 'Оруэлл', 'Роулинг', 'Тургенев', 'Шолохов', 'Гоголь', 'Пушкин', 'Чехов'];
const GENRES = ['роман', 'антиутопия', 'фэнтези', 'детектив', 'поэзия'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateISBN() {
  return '978-' + Math.floor(Math.random() * 9000000000 + 1000000000);
}

function generateBooks(count) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    result.push({
      id: i,
      title: randomFrom(TITLES),
      author: randomFrom(AUTHORS),
      year: Math.floor(Math.random() * 200) + 1820,
      genre: randomFrom(GENRES),
      isbn: generateISBN(),
      available: Math.random() > 0.3,
      reviews: []
    });
  }
  return result;
}

let books = generateBooks(100);
let nextId = 101;
let users = [];
let nextUserId = 1;

console.log(`Сгенерировано ${books.length} книг`);

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();
  const key = req.originalUrl;
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) {
    return res.json(entry.data);
  }
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, { data, time: Date.now() });
    originalJson(data);
  };
  next();
}

app.use(cacheMiddleware);

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Требуется токен', status: 401 });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Неверный токен', status: 403 });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Только для администраторов', status: 403 });
  }
  next();
}

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'LR16 Library API', version: '1.0.0' }
  },
  apis: [__filename]
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const bookSchema = Joi.object({
  title: Joi.string().min(1).required(),
  author: Joi.string().min(1).required(),
  year: Joi.number().integer().min(1000).max(2100).required(),
  genre: Joi.string().min(1).required()
});

app.post('/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Поля email, password, name обязательны', status: 400 });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email уже занят', status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { id: nextUserId++, email, password: hash, name, role: role || 'user' };
  users.push(user);
  res.status(201).json({ message: 'Регистрация успешна', userId: user.id });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Неверный email или пароль', status: 401 });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/books', authMiddleware, (req, res) => {
  let result = [...books];

  if (req.query.author) {
    result = result.filter(b => b.author.toLowerCase().includes(req.query.author.toLowerCase()));
  }
  if (req.query.genre) {
    result = result.filter(b => b.genre === req.query.genre);
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }
  if (req.query.sort) {
    const desc = req.query.sort.startsWith('-');
    const field = desc ? req.query.sort.slice(1) : req.query.sort;
    result.sort((a, b) => {
      if (a[field] < b[field]) return desc ? 1 : -1;
      if (a[field] > b[field]) return desc ? -1 : 1;
      return 0;
    });
  }

  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  res.json({ total, page, limit, totalPages, data: paginated });
});

app.get('/api/books/available', authMiddleware, (req, res) => {
  const available = books.filter(b => b.available);
  res.json({ total: available.length, data: available });
});

app.get('/api/books/export', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=books.json');
  res.json(books);
});

app.get('/api/books/recommendations', authMiddleware, (req, res) => {
  const { genre } = req.query;
  if (!genre) return res.status(400).json({ error: 'Параметр genre обязателен', status: 400 });
  const rec = books.filter(b => b.genre === genre).slice(0, 5);
  res.json({ genre, recommendations: rec });
});

app.get('/api/books/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  res.json(book);
});

app.post('/api/books', authMiddleware, adminMiddleware, (req, res) => {
  const { error, value } = bookSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, status: 400 });
  const book = { id: nextId++, ...value, isbn: generateISBN(), available: true, reviews: [] };
  books.push(book);
  res.status(201).json(book);
});

app.put('/api/books/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  const { title, author, year, genre, available } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  if (year) book.year = year;
  if (genre) book.genre = genre;
  if (typeof available === 'boolean') book.available = available;
  cache.clear();
  res.json(book);
});

app.delete('/api/books/:id', authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  const deleted = books.splice(index, 1)[0];
  cache.clear();
  res.json({ message: 'Книга удалена', book: deleted });
});

app.post('/api/books/:id/reviews', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  const { text, rating } = req.body;
  if (!text || !rating) return res.status(400).json({ error: 'Поля text, rating обязательны', status: 400 });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Рейтинг от 1 до 5', status: 400 });
  const review = { id: book.reviews.length + 1, user: req.user.email, text, rating, date: new Date().toISOString() };
  book.reviews.push(review);
  res.status(201).json(review);
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`Регистрация: POST /auth/register`);
  console.log(`Логин: POST /auth/login`);
});