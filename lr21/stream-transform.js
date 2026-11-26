const { Transform, Readable, Writable } = require('stream');

// 1. Transform-поток: Верхний регистр + префикс
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const str = chunk.toString();
    this.push(`[BBMO-01-23] ${str.toUpperCase()}`);
    callback();
  }
}

// 2. Transform-поток: Фильтрация объектов
class FilterTransform extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true }); // Включаем режим объектов
  }
  _transform(obj, encoding, callback) {
    if (obj.group === 'ББМО-01-23') {
      this.push(obj); // Пропускаем только нашу группу
    }
    callback();
  }
}

// Функция для запуска демонстрации Transform
function demoTransform() {
  console.log('=== Демонстрация Transform-потока ===');
  const upper = new UpperCaseTransform();
  
  upper.on('data', (data) => {
    console.log(`Выход: "${data.toString().trim()}"`);
  });

  console.log('Вход: "группа ббмо-01-23"');
  upper.write('группа ббмо-01-23\n');

  console.log('Вход: "студент иванов"');
  upper.write('студент иванов\n');
}

// Функция для запуска Object Mode
function demoObjectMode() {
  console.log('\n=== Демонстрация Object Mode ===');
  
  // Создаем поток объектов (Readable)
  const objects = [
    { id: 1, name: 'Иван', group: 'ББМО-01-23' },
    { id: 2, name: 'Мария', group: 'ББМО-02-23' },
    { id: 3, name: 'Петр', group: 'ББМО-01-23' }
  ];

  const readable = Readable.from(objects);
  const filter = new FilterTransform();

  // Приемник объектов (Writable)
  const writable = new Writable({
    objectMode: true,
    write(obj, encoding, callback) {
      console.log(`[OBJECT] ${JSON.stringify(obj)}`);
      callback();
    }
  });

  readable.pipe(filter).pipe(writable);
}

// Функция для async iterator
async function demoAsyncIterator() {
  console.log('\n=== Демонстрация async iterator ===');
  
  const readable = Readable.from(['Данные 1', 'Данные 2', 'Данные 3']);
  
  let count = 1;
  // Читаем поток через for await (альтернатива pipe)
  for await (const chunk of readable) {
    console.log(`[ASYNC] Получен чанк ${count}: "${chunk}"`);
    count++;
  }
  console.log('[ASYNC] Поток завершён');
}

// Запускаем всё по очереди
demoTransform();

setTimeout(() => {
  demoObjectMode();
  setTimeout(() => {
    demoAsyncIterator();
  }, 100);
}, 100); 
