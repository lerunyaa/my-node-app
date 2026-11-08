const { program } = require('commander');

program
  .name('my-cli')
  .description('CLI-приложение для лабораторной работы №17')
  .version('1.0.0');

program
  .command('generate')
  .description('сгенерировать отчёт')
  .option('-t, --type <type>', 'тип отчёта', 'html')
  .option('-o, --output <path>', 'путь для сохранения', 'output.html')
  .option('-f, --force', 'перезаписать существующий файл')
  .option('--dry-run', 'показать что будет сделано без выполнения')
  .option('-v, --verbose', 'подробный вывод')
  .action((options) => {
    const validTypes = ['html', 'pdf', 'json', 'csv'];

    if (!validTypes.includes(options.type)) {
      console.error(`Ошибка: недопустимый тип отчёта "${options.type}".`);
      console.error(`Допустимые значения: ${validTypes.join(', ')}`);
      process.exit(1);
    }

  
    if (options.verbose) {
      console.log('[VERBOSE] Запуск генерации отчёта...');
      console.log(`[VERBOSE] Тип отчёта: ${options.type}`);
      console.log(`[VERBOSE] Путь сохранения: ${options.output}`);
    }

    // Dry-run
    if (options.dryRun) {
      console.log(`[DRY-RUN] Будет сгенерирован отчёт типа: ${options.type}`);
      console.log(`[DRY-RUN] Файл будет сохранён в: ${options.output}`);
      console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
      process.exit(0);
    }

    console.log(`Отчёт успешно сгенерирован: ${options.output}`);
    process.exit(0);
  });

program.parse();