const { program } = require('commander');
const initCommand = require('./init');
const buildCommand = require('./build');
const testCommand = require('./test');
const deployCommand = require('./deploy');

program.name('my-cli').description('CLI-приложение ЛР №17').version('1.0.0');

program.command('init').description('инициализировать проект')
  .option('--name <name>', 'название проекта')
  .option('--type <type>', 'тип проекта', 'cli')
  .action(initCommand);

program.command('build').description('собрать проект')
  .option('--dry-run', 'без изменений')
  .action(buildCommand);

program.command('test').description('запустить тесты').action(testCommand);

program.command('deploy').description('развернуть проект')
  .option('--env <env>', 'окружение', 'production')
  .option('--force', 'без подтверждения')
  .action(deployCommand);

program.parse();