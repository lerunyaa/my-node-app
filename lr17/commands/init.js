const chalk = require('chalk');
module.exports = (options) => {
  console.log(chalk.green(`✔ Проект "${options.name}" создан`));
  console.log(chalk.green('✔ Установлены зависимости'));
  console.log(chalk.green('✔ Инициализирован Git-репозиторий'));
  console.log('Проект готов к работе!');
};