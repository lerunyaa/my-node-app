const args = process.argv.slice(2);
const GROUP = 'ББМО-01-23'; // ← замените на свою группу
const STUDENT = 'Какулина Валерия'; // ← ваше ФИО

function showHelp() {
  console.log('Использование: my-cli <команда> [аргументы]');
  console.log('');
  console.log('Доступные команды:');
  console.log('  greet <имя>   - поприветствовать пользователя');
  console.log('  info          - вывести информацию о группе');
  console.log('  --help        - показать эту справку');
}

function main() {
  const [command, ...rest] = args;

  // Нет аргументов или --help → справка
  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  if (command === 'greet') {
    const name = rest[0];
    if (!name) {
      console.error('Ошибка: укажите имя');
      console.error('Пример: my-cli greet "Иван"');
      process.exit(1);
    }
    console.log(`Привет, ${name}! Добро пожаловать в CLI-приложение группы ${GROUP}.`);
    process.exit(0);
  }

  if (command === 'info') {
    const date = new Date().toISOString().slice(0, 10);
    console.log(`Группа: ${GROUP}`);
    console.log(`Студент: ${STUDENT}`);
    console.log('Лабораторная работа: №17');
    console.log(`Дата: ${date}`);
    process.exit(0);
  }

  console.error(`Ошибка: неизвестная команда "${command}"`);
  console.error('Для справки используйте: my-cli --help');
  process.exit(1);
}

main();