const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
  constructor(group) {
    super();
    this.group = group;
  }

  connect() {
    console.log('[EVENT] Подключение к БД...');
    this.emit('connect', 'Соединение установлено');
  }

  query(sql) {
    console.log(`[EVENT] Выполнение запроса: ${sql}`);
    const result = sql.startsWith('SELECT') ? '50 записей' : '1 запись добавлена';
    this.emit('query', sql, result);
  }

  close() {
    console.log('[EVENT] Закрытие соединения');
    this.emit('close', 'Соединение закрыто');
  }

  error(message) {
    this.emit('error', message);
  }
}

console.log('=== DatabaseConnection (группа ББМО-01-23) ===');

const db = new DatabaseConnection('ББМО-01-23');

db.on('connect', (msg) => console.log(`[EVENT] ${msg}`));
db.on('query', (sql, result) => console.log(`[EVENT] Результат: ${result}`));
db.on('close', (msg) => console.log(`[EVENT] ${msg}`));
db.on('error', (err) => console.log(`[EVENT] Ошибка: ${err}`));

db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students');
db.close();

console.log('=== Демонстрация ошибки ===');
db.error('Connection timeout');
console.log('(без слушателя error — процесс упал бы с исключением)'); 
