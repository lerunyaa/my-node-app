const chalk = require('chalk');
const readline = require('readline');

module.exports = (options) => {
  const proceed = () => {
    console.log(chalk.green('✔ Развёрнуто успешно'));
    console.log('URL: https://my-app.example.com');
  };

  if (options.force) return proceed();

  console.log(chalk.yellow(`△ Вы собираетесь развернуть проект в ${options.env}!`));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Продолжить? (y/N) ', (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y') proceed();
    else { console.log('Отменено.'); process.exit(0); }
  });
};