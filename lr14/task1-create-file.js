const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7; 
const FILE_NAME = `student_${VARIANT}.txt`;

async function main() {
  try {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace('T', ' ');

    const lines = [
      'Студент: Какулина Валерия',         
      'Группа: 401',                             
      `Вариант: ${VARIANT}`,
      `Дата: ${dateStr}`,
      '',
      'Любимые книги:',
      '1. "Война и мир" - Л. Толстой',
      '2. "Преступление и наказание" - Ф. Достоевский',
      '3. "Мастер и Маргарита" - М. Булгаков',
      '4. "1984" - Дж. Оруэлл',
      '5. "Гарри Поттер" - Дж. Роулинг'
    ];

    const count = lines.filter(l => l.trim() !== '').length;
    lines.push(`Количество записей: ${count}`);

    const filePath = path.join(__dirname, FILE_NAME);
    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
    console.log(`Создан файл: ${FILE_NAME}`);

    const content = await fs.readFile(filePath, 'utf8');
    console.log('Содержимое файла:\n');
    console.log(content);
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

main();