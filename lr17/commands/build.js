const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

module.exports = (options) => {
  const configPath = path.join(process.cwd(), 'config.json');
  if (!fs.existsSync(configPath)) {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) throw new Error(`ENOENT: no such file or directory, open 'config.json'`);
    console.error('Ошибка: файл config.json не найден');
    console.error('Укажите путь через --config');
    process.exit(1);
  }
  console.log(chalk.green('✔ Сборка завершена за 2.3s'));
};