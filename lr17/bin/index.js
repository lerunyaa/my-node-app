process.on('uncaughtException', (err) => {
  const isDev = process.env.NODE_ENV === 'development';
  console.error(`Ошибка: ${err.message}`);
  if (isDev) console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const isDev = process.env.NODE_ENV === 'development';
  console.error(`Ошибка: ${reason}`);
  if (isDev && reason instanceof Error) console.error(reason.stack);
  process.exit(1);
});

require('../commands/index.js');