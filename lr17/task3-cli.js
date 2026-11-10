const { program } = require('commander');
const inquirer = require('inquirer');

program
  .name('my-cli')
  .version('1.0.0');

program
  .command('init')
  .description('инициализировать проект')
  .option('--name <name>', 'название проекта')
  .option('--type <type>', 'тип проекта (web/cli/lib/micro)')
  .option('--typescript', 'добавить TypeScript')
  .option('--eslint', 'добавить ESLint')
  .option('--prettier', 'добавить Prettier')
  .option('--jest', 'добавить Jest')
  .option('--git', 'инициализировать Git')
  .option('--no-interactive', 'отключить интерактив')
  .action(async (options) => {
    const interactive = options.interactive !== false;


    if (!interactive) {
      if (!options.name || !options.type) {
        console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
        process.exit(1);
      }

      const opts = [];
      if (options.typescript) opts.push('TypeScript');
      if (options.eslint) opts.push('ESLint');
      if (options.prettier) opts.push('Prettier');
      if (options.jest) opts.push('Jest');

      console.log(`✔ Проект "${options.name}" успешно инициализирован!`);
      console.log(`Тип: ${options.type}`);
      console.log(`Опции: ${opts.join(', ') || 'нет'}`);
      console.log(`Git: ${options.git ? 'да' : 'нет'}`);
      process.exit(0);
    }

    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Введите название проекта:',
          default: 'my-project'
        },
        {
          type: 'list',
          name: 'type',
          message: 'Выберите тип проекта:',
          choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис']
        },
        {
          type: 'checkbox',
          name: 'options',
          message: 'Выберите дополнительные опции:',
          choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest']
        },
        {
          type: 'confirm',
          name: 'git',
          message: 'Использовать Git?',
          default: true
        },
        {
          type: 'password',
          name: 'token',
          message: 'Введите токен доступа:',
          mask: '*'
        }
      ]);

      console.log(`✔ Проект "${answers.name}" успешно инициализирован!`);
      console.log(`Тип: ${answers.type}`);
      console.log(`Опции: ${answers.options.join(', ') || 'нет'}`);
      console.log(`Git: ${answers.git ? 'да' : 'нет'}`);
      process.exit(0);
    } catch (err) {
      console.error('Ошибка:', err.message);
      process.exit(1);
    }
  });

program.parse();