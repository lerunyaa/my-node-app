const EventEmitter = require('events');
const GROUP = '401';

class DatabaseConnection extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }

  connect() {
    this.connected = true;
    this.emit('connect');
  }

  query(sql) {
    if (!this.connected) {
      this.emit('error', new Error('Нет соединения'));
      return;
    }
    let result;
    if (sql.toUpperCase().startsWith('SELECT')) {
      result = '50 записей';
    } else if (sql.toUpperCase().startsWith('INSERT')) {
      result = '1 запись добавлена';
    } else {
      result = 'OK';
    }
    this.emit('query', sql, result);
  }

  close() {
    this.connected = false;
    this.emit('close');
  }

  fail(message) {
    this.emit('error', new Error(message));
  }
}

console.log(`=== DatabaseConnection (группа ${GROUP}) ===`);

const db = new DatabaseConnection();

db.on('connect', () => {
  console.log('[EVENT] Соединение установлено');
});

db.on('query', (sql, result) => {
  console.log(`[EVENT] Выполнение запроса: ${sql}`);
  console.log(`[EVENT] Результат: ${result}`);
});

db.on('close', () => {
  console.log('[EVENT] Соединение закрыто');
});

db.on('error', (err) => {
  console.log(`[EVENT] Ошибка: ${err.message}`);
});

console.log('[EVENT] Подключение к БД...');
db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students ...');
db.close();

console.log('\n=== Демонстрация ошибки ===');
db.fail('Connection timeout');
console.log('(без слушателя error — процесс упал бы с исключением)');