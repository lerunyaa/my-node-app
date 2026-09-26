const express = require('express');

const app = express();
const PORT = 3001;

// Middleware для парсинга JSON
app.use(express.json());

let books = [
  { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 },
  { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866 },
  { id: 3, title: 'Мастер и Маргарита', author: 'Булгаков', year: 1967 }
];
let nextId = 4;

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/search', (req, res) => {
  const { author } = req.query;
  if (!author) {
    return res.status(400).json({ error: 'Параметр author обязателен', status: 400 });
  }
  const result = books.filter(b =>
    b.author.toLowerCase().includes(author.toLowerCase())
  );
  res.json(result);
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }
  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, year } = req.body;

    if (!title || !author || !year) {
    return res.status(400).json({ error: 'Поля title, author, year обязательны', status: 400 });
  }
  if (typeof year !== 'number') {
    return res.status(400).json({ error: 'Поле year должно быть числом', status: 400 });
  }

  const book = { id: nextId++, title, author, year };
  books.push(book);
  res.status(201).json(book);
});

app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }

  const { title, author, year } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  if (year) book.year = year;
  res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Книга не найдена', status: 404 });
  }
  const deleted = books.splice(index, 1)[0];
  res.json({ message: 'Книга удалена', book: deleted });
});

app.listen(PORT, () => {
  console.log(`REST API запущен: http://localhost:${PORT}`);
  console.log(`Маршруты:`);
  console.log(`  GET    http://localhost:${PORT}/api/books`);
  console.log(`  GET    http://localhost:${PORT}/api/books/1`);
  console.log(`  GET    http://localhost:${PORT}/api/books/search?author=Толстой`);
  console.log(`  POST   http://localhost:${PORT}/api/books`);
  console.log(`  PUT    http://localhost:${PORT}/api/books/1`);
  console.log(`  DELETE http://localhost:${PORT}/api/books/1`);
});