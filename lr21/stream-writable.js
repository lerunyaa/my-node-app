const { Writable } = require('stream');

console.log('=== Демонстрация Writable-потока ===');

let chunksProcessed = 0;

// Создаем Writable-поток с маленьким буфером (16 байт)
const writableStream = new Writable({
  highWaterMark: 16, // Очень маленький буфер для демонстрации backpressure
  
  write(chunk, encoding, callback) {
    chunksProcessed++;
    
    // Выводим данные с префиксом
    console.log(`[WRITE] ${chunk.toString().trim()}`);
    
    // Имитируем задержку обработки (например, запись на диск)
    setTimeout(() => {
      callback(); // Сообщаем, что чанк обработан
    }, 50);
  }
});

// Подписываемся на события
writableStream.on('drain', () => {
  console.log('[DRAIN] Буфер освобождён, продолжаем запись');
});

writableStream.on('finish', () => {
  console.log('[FINISH] Все данные записаны');
  console.log(`Всего записано: ${chunksProcessed} чанка`);
});

writableStream.on('error', (err) => {
  console.error('Ошибка:', err);
});

// Данные для записи
const dataToWrite = [
  "Группа: 401",
  "Студент: Лера",
  "Лабораторная работа: №21",
  "Тема: Потоки в Node.js"
];

// Записываем данные
dataToWrite.forEach((data, index) => {
  // Метод write возвращает true (буфер свободен) или false (буфер переполнен)
  const result = writableStream.write(data);
  console.log(`write() вернул: ${result} ${result ? '' : '← буфер переполнен!'}`);
});

// Завершаем поток
writableStream.end(); 
