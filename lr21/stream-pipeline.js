const { Readable, Transform, Writable, PassThrough } = require('stream');
const fs = require('fs');

const GROUP = 'BBMO-01-23'; // Используем латиницу для логов
const TOTAL_STUDENTS = 10000;

let stats = {
  generated: 0,
  validated: 0,
  enriched: 0,
  filtered: 0,
  written: 0,
  errors: 0
};

const startTime = Date.now();

// 1. Readable: Генератор студентов
class StudentGenerator extends Readable {
  constructor() {
    super({ objectMode: true });
    this.count = 0;
  }
  _read() {
    if (this.count >= TOTAL_STUDENTS) {
      this.push(null);
      return;
    }
    this.count++;
    stats.generated++;
    
    // Специально делаем несколько битых записей для проверки ошибок
    const isCorrupted = this.count % 1000 === 0;
    
    this.push({
      id: this.count,
      name: isCorrupted ? null : `Студент ${this.count}`,
      group: GROUP,
      course: Math.floor(Math.random() * 4) + 1,
      grade: isCorrupted ? 10 : (Math.random() * 4 + 2).toFixed(1) // Оценки от 2.0 до 6.0
    });
  }
}

// 2. Transform: Валидация
const validateTransform = new Transform({
  objectMode: true,
  transform(student, encoding, callback) {
    // Если имя пустое или оценка больше 5 (наша битая запись)
    if (!student.name || parseFloat(student.grade) > 5) {
      stats.errors++;
      fs.appendFileSync('errors.log', `[${new Date().toISOString()}] [${GROUP}] Error: invalid data for id=${student.id}\n`);
      return callback(); // Пропускаем битую запись
    }
    stats.validated++;
    callback(null, student);
  }
});

// 3. Transform: Обогащение
const enrichTransform = new Transform({
  objectMode: true,
  transform(student, encoding, callback) {
    student.averageGrade = ((parseFloat(student.grade) + 4.0) / 2).toFixed(2);
    stats.enriched++;
    callback(null, student);
  }
});

// 4. Transform: Фильтрация (оценка > 3)
const filterTransform = new Transform({
  objectMode: true,
  transform(student, encoding, callback) {
    if (parseFloat(student.grade) > 3) {
      stats.filtered++;
      callback(null, student);
    } else {
      callback(); // Отфильтровываем (не передаем дальше)
    }
  }
});

// 5. Transform: Форматирование в CSV
const formatTransform = new Transform({
  writableObjectMode: true, // На входе объекты
  readableObjectMode: false, // На выходе строки
  transform(student, encoding, callback) {
    const csvLine = `${student.id},${student.name},${student.group},${student.course},${student.grade},${student.averageGrade}\n`;
    callback(null, csvLine);
  }
});

// 6. Writable: Счетчик и логирование backpressure
const writableStream = new Writable({
  write(chunk, encoding, callback) {
    stats.written++;
    
    // Имитация задержки для backpressure (каждая 2000-я запись)
    if (stats.written % 2000 === 0) {
      console.log(`[BACKPRESSURE] Writable переполнен на ${stats.written}-й записи`);
      setTimeout(() => {
        console.log(`[DRAIN] Продолжаем запись`);
        callback();
      }, 50);
    } else {
      callback();
    }
  }
});

// Запуск конвейера
console.log(`=== Конвейер обработки данных (группа ББМО-01-23) ===`);
console.log(`Источник: ${TOTAL_STUDENTS} студентов`);
console.log(`Фильтр: оценка > 3\n`);

// Очищаем старые файлы перед запуском
if (fs.existsSync('students.csv')) fs.unlinkSync('students.csv');
if (fs.existsSync('errors.log')) fs.unlinkSync('errors.log');

// Создаем поток для записи в файл
const fileStream = fs.createWriteStream('students.csv');
fileStream.write('id,name,group,course,grade,averageGrade\n');

// PassThrough нужен, чтобы аккуратно соединить наши Transform-потоки с файлом
const passToFile = new PassThrough();
passToFile.pipe(fileStream); // Все, что попадает в passToFile, улетает в файл

// Собираем цепочку
const pipelineStream = new StudentGenerator()
  .pipe(validateTransform)
  .pipe(enrichTransform)
  .pipe(filterTransform)
  .pipe(formatTransform)
  .pipe(passToFile);

// Подключаем Writable для подсчета статистики и эмуляции задержек
pipelineStream.on('data', (chunk) => {
  if (!writableStream.write(chunk)) {
    pipelineStream.pause();
    writableStream.once('drain', () => pipelineStream.resume());
  }
});

// Когда всё закончилось
writableStream.on('finish', () => {
  fileStream.end();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\n=== Результаты ===`);
  console.log(`Всего сгенерировано: ${stats.generated}`);
  console.log(`Прошло валидацию: ${stats.validated}`);
  console.log(`Обогащено: ${stats.enriched}`);
  console.log(`Отфильтровано: ${stats.filtered}`);
  console.log(`Записано в CSV: ${stats.written}`);
  console.log(`Ошибок: ${stats.errors}`);
  console.log(`Время выполнения: ${duration.toFixed(2)} сек`);
  console.log(`Средняя скорость: ${Math.round(stats.written / duration)} записей/сек`);
});

// Завершаем поток, когда данные кончились
pipelineStream.on('end', () => {
  writableStream.end();
});