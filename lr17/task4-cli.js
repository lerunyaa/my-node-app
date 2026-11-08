const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const fs = require('fs');

const isTTY = process.stdout.isTTY;

program
  .name('my-cli')
  .version('1.0.0');

program
  .command('process')
  .description('обработать файлы')
  .option('--files <files...>', 'список файлов')
  .option('--progress', 'показать прогресс-бар')
  .action(async (options) => {
    const files = options.files || [];

    if (files.length === 0) {
      console.error(chalk.red('Ошибка: укажите файлы через --files'));
      process.exit(1);
    }

    let processed = 0;
    let missing = 0;

    const spinner = isTTY ? ora('Обработка файлов...').start() : null;

    let bar = null;
    if (options.progress && isTTY) {
      bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
      bar.start(files.length, 0);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Проверяем существование файла
      if (fs.existsSync(file)) {
        if (isTTY) console.log(chalk.green(`✔ Файл ${file} обработан`));
        processed++;
      } else {
        // ВАЖНО: stderr выводится ВСЕГДА (даже при редиректе), поэтому убрано if(isTTY)
        console.error(chalk.red(`✖ Файл ${file} не найден`));
        missing++;
      }
      if (bar) bar.update(i + 1);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (bar) bar.stop();
    if (spinner) spinner.stop();

    if (missing > 0) {
      console.error(chalk.yellow(`△ Пропущено ${missing} файл(ов)`));
    }
    if (isTTY) {
      console.log(chalk.green(`✔ Обработка завершена. Обработано: ${processed}`));
    }
    
    if (!isTTY) {
      console.log(JSON.stringify({ processed, missing, files }));
    }

    process.exit(missing > 0 ? 1 : 0);
  });

program.parse();