const fs = require('fs');
const { pipeline } = require('stream');

console.log('=== Демонстрация pipe() ===');
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output-pipe.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('✔ Копирование завершено (pipe)');
  console.log('Размер:', fs.statSync('output-pipe.txt').size, 'байт\n');

  // --- Демонстрация с ошибкой ---
  console.log('=== Демонстрация pipe() с ошибкой ===');
  const badRead = fs.createReadStream('missing.txt');
  const badWrite = fs.createWriteStream('output-error.txt');

  // pipe() НЕ ЗАКРЫВАЕТ поток записи при ошибке чтения
  badRead.pipe(badWrite);

  badRead.on('error', (err) => {
    console.log('Ошибка чтения:', err.code);
    console.log('Внимание: pipe() не закрыл целевой поток! Возможна утечка памяти.\n');
    
    // Запускаем pipeline после этой ошибки
    runPipelineDemo();
  });
});

function runPipelineDemo() {
  console.log('=== Демонстрация pipeline() ===');
  pipeline(
    fs.createReadStream('input.txt'),
    fs.createWriteStream('output-pipeline.txt'),
    (err) => {
      if (err) {
        console.error('Ошибка pipeline:', err);
      } else {
        console.log('✔ Копирование завершено (pipeline)\n');
      }

      // --- pipeline с ошибкой ---
      console.log('=== Демонстрация pipeline() с ошибкой ===');
      pipeline(
        fs.createReadStream('missing.txt'),
        fs.createWriteStream('output-pipeline-error.txt'),
        (err) => {
          if (err) {
            console.log('Ошибка чтения:', err.code);
            console.log('✔ Все потоки автоматически закрыты. Утечек нет.');
          }
        }
      );
    }
  );
} 
