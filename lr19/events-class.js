const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
  constructor(group) {
    super();
    this.group = group;
    this.connected = false;
  }

  connect() {
    this.emit('connect', { group: this.group });
    this.connected = true;
  }

  query(sql, result) {
    if (!this.connected) {
      this.emit('error', new Error('Нет соединения'));
      return;
    }
    this.emit('query', sql);
    this.emit('result', result);
  }

  close() {
    this.emit('close');
    this.connected = false;
  }

  forceError(message) {
    this.emit('error', new Error(message));
  }
}

const db = new DatabaseConnection('ББМО-01-23');

console.log('=== DatabaseConnection (группа ББМО-01-23) ===');

db.on('connect', () => {
  console.log('[EVENT] Подключение к БД...');
  console.log('[EVENT] Соединение установлено');
});

db.on('query', (sql) => {
  console.log(`[EVENT] Выполнение запроса: ${sql}`);
});

db.on('result', (res) => {
  console.log(`[EVENT] Результат: ${res}`);
});

db.on('close', () => {
  console.log('[EVENT] Закрытие соединения');
  console.log('[EVENT] Соединение закрыто');
});

db.on('error', (err) => {
  console.log(`[EVENT] Ошибка: ${err.message}`);
});

db.connect();
db.query('SELECT * FROM students', '50 записей');
db.query('INSERT INTO students', '1 запись добавлена');
db.close();

console.log('\n=== Демонстрация ошибки ===');
db.forceError('Connection timeout');
console.log('(без слушателя error — процесс упал бы с исключением)');