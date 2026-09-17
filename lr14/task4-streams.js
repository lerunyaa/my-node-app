const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const readline = require('readline');

const VARIANT = 7;
const DATA_FILE = `data_${VARIANT}.txt`;
const PROCESSED_FILE = `processed_${VARIANT}.txt`;
const TOTAL_LINES = 100000;

async function generateFile() {
  try {
    await fsp.access(path.join(__dirname, DATA_FILE));
    console.log(`Файл ${DATA_FILE} уже существует`);
  } catch {
    console.log(`Генерация файла ${DATA_FILE} (${TOTAL_LINES} строк)...`);
    const stream = fs.createWriteStream(path.join(__dirname, DATA_FILE));
    for (let i = 1; i <= TOTAL_LINES; i++) {
      const num = Math.floor(Math.random() * 1000) + 1;
      stream.write(`${i}, ${num}, Вариант ${VARIANT}\n`);
    }
    stream.end();
    await new Promise(res => stream.on('finish', res));
    console.log(`Файл ${DATA_FILE} создан`);
  }
}

async function processFile() {
  const filePath = path.join(__dirname, DATA_FILE);
  const stat = await fsp.stat(filePath);
  console.log(`\nОбработка файла: ${DATA_FILE}`);
  console.log(`Размер файла: ${(stat.size / 1024 / 1024).toFixed(2)} МБ\n`);

  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;
  let even = 0;
  let odd = 0;
  let lastProgress = 0;
  const freq = new Map();

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const num = parseInt(parts[1].trim(), 10);
      if (!isNaN(num)) {
        sum += num;
        count++;
        if (num < min) min = num;
        if (num > max) max = num;
        if (num % 2 === 0) even++;
        else odd++;

        // Увеличиваем счётчик частоты
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }

    const progress = Math.floor((count / TOTAL_LINES) * 100);
    if (progress >= lastProgress + 10) {
      lastProgress = progress;
      console.log(`Прогресс: ${progress}% (${count.toLocaleString()} строк обработано)`);
    }
  }

  const avg = (sum / count).toFixed(2);

  const top10 = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\nОбработка завершена!');
  console.log('Результаты:');
  console.log(`- Всего строк: ${count.toLocaleString()}`);
  console.log(`- Сумма чисел: ${sum.toLocaleString()}`);
  console.log(`- Среднее значение: ${avg}`);
  console.log(`- Максимальное число: ${max}`);
  console.log(`- Минимальное число: ${min}`);
  console.log(`- Четных чисел: ${even.toLocaleString()}`);
  console.log(`- Нечетных чисел: ${odd.toLocaleString()}`);

  console.log('\nТоп-10 самых часто встречающихся чисел:');
  top10.forEach(([num, cnt], i) => {
    console.log(`  ${i + 1}. Число ${num} — ${cnt} раз`);
  });

  const report = [
    `Всего строк: ${count}`,
    `Сумма чисел: ${sum}`,
    `Среднее значение: ${avg}`,
    `Максимальное число: ${max}`,
    `Минимальное число: ${min}`,
    `Четных чисел: ${even}`,
    `Нечетных чисел: ${odd}`,
    '',
    'Топ-10 самых частых чисел:',
    ...top10.map(([n, c], i) => `${i + 1}. ${n} — ${c} раз`)
  ].join('\n');

  await fsp.writeFile(path.join(__dirname, PROCESSED_FILE), report, 'utf8');
  console.log(`\nРезультаты сохранены в: ${PROCESSED_FILE}`);
}

async function main() {
  const start = Date.now();
  await generateFile();
  await processFile();
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Время выполнения: ${elapsed} сек`);
}

main();