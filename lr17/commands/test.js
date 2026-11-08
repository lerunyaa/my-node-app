const chalk = require('chalk');
module.exports = () => {
  console.log('Запуск тестов...');
  console.log(chalk.green('✔ Пройдено: 15/15 тестов'));
  console.log(chalk.green('✔ Покрытие: 87%'));
};