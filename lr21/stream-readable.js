const { Readable } = require('stream');

console.log('=== Демонстрация Readable-потока ===');

const chunks = [
  "Группа: 401",
  "Студент: Лера",
  "Лабораторная работа: №21",
  "Тема: Потоки в Node.js"
];

let chunkIndex = 0;
let totalSize = 0;
let chunkCount = 0;

// Создаем Readable-поток
const readableStream = new Readable({
  read(size) {
    // Если данные закончились — отправляем null (конец потока)
    if (chunkIndex >= chunks.length) {
      this.push(null);
      return;
    }

    const chunk = chunks[chunkIndex];
    chunkCount++;
    
    // Считаем размер в байтах
    const byteLength = Buffer.byteLength(chunk, 'utf8');
    totalSize += byteLength;

    console.log(`[CHUNK ${chunkCount}] ${chunk}`);
    
    // Отправляем чанк в поток (в виде Buffer)
    this.push(chunk + '\n');
    
    chunkIndex++;
  }
});

// Подписываемся на события
readableStream.on('data', (chunk) => {
  // Данные приходят в виде Buffer, поэтому переводим в строку
  // console.log(`Получено данных: ${Buffer.byteLength(chunk)} байт`);
});

readableStream.on('end', () => {
  console.log('[END] Поток завершён');
  console.log(`Всего получено чанков: ${chunkCount}`);
  console.log(`Общий размер данных: ${totalSize} байт`);
});

readableStream.on('error', (err) => {
  console.error('Ошибка:', err);
});