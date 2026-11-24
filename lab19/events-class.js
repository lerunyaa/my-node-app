const { EventEmitter } = require('events');

class DatabaseConnection extends EventEmitter {
  connect() {
    this.emit('connect', 'Подключение к БД...');
  }

  query(sql, result) {
    this.emit('query', sql, result);
  }

  close() {
    this.emit('close');
  }

  error(message) {
    this.emit('error', new Error(message));
  }
}

console.log('=== DatabaseConnection (группа ББМО-01-23) ===');

const db = new DatabaseConnection();

db.on('connect', (msg) => console.log(`[EVENT] ${msg}`));
db.on('query', (sql, result) => {
  console.log(`[EVENT] Выполнение запроса: ${sql}`);
  console.log(`[EVENT] Результат: ${result}`);
});
db.on('close', () => {
  console.log('[EVENT] Закрытие соединения');
  console.log('[EVENT] Соединение закрыто');
});

db.connect();
db.query('SELECT * FROM students', '50 записей');
db.query('INSERT INTO students', '1 запись добавлена');
db.close();

console.log('\n=== Демонстрация ошибки ===');

// Слушатель для ошибки (чтобы программа не упала)
db.on('error', (err) => console.log(`[EVENT] Ошибка: ${err.message}`));
db.error('Connection timeout');
console.log('(без слушателя error — процесс упал бы с исключением)');