const FileManagerPromises = require('./fileOperations-promises');

const fileManager = new FileManagerPromises('./data');

async function testFileOperations() {
  try {
    console.log('=== Демонстрация работы с файлами через промисы ===\n');

    await fileManager.init();

    console.log('1. Создание файлов...');
    const fileList = ['promise1.txt', 'promise2.txt', 'promise3.txt'];
    await fileManager.createMultipleFiles([
      { filename: 'promise1.txt', content: 'Первый файл через промисы' },
      { filename: 'promise2.txt', content: 'Второй файл через промисы' },
      { filename: 'promise3.txt', content: 'Третий файл через промисы' }
    ]);
    console.log('  Все файлы созданы');

    console.log('\n2. Чтение одного файла...');
    const content = await fileManager.readFile('promise1.txt');
    console.log(`  Содержимое promise1.txt: "${content}"`);

    console.log('\n3. Статистика promise1.txt...');
    const stats = await fileManager.getFileStats('promise1.txt');
    console.log(`  Размер: ${stats.size} байт`);
    console.log(`  Создан: ${stats.created}`);
    console.log(`  Изменён: ${stats.modified}`);

    console.log('\n4. Список файлов...');
    const files = await fileManager.listFiles();
    files.forEach(file => console.log(`    - ${file}`));

    console.log('\n5. Чтение нескольких файлов параллельно...');
    const contents = await fileManager.readMultipleFiles(fileList);
    console.log('  Содержимое файлов:');
    Object.entries(contents).forEach(([filename, content]) => {
      console.log(`    - ${filename}: "${content}"`);
    });

    console.log('\n6. Очистка...');
    for (const file of fileList) {
      await fileManager.deleteFile(file);
      console.log(`  ${file} удалён`);
    }

    console.log('\nВсе операции завершены!');
    console.log('Код стал намного чище и читаемее!');
  } catch (error) {
    console.error('\nОшибка:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFileOperations();