const { EventEmitter } = require('events');

console.log('=== Система плагинов ===');

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.on('newListener', (event) => {
      console.log(`[newListener] Добавлен слушатель "${event}"`);
    });
    this.on('removeListener', (event) => {
      console.log(`[removeListener] Удалён слушатель "${event}"`);
    });
  }
}

const pm = new PluginManager();

pm.on('plugin:registered', (name) => console.log(`[PLUGIN] Зарегистрирован: ${name}`));
pm.on('plugin:removed', (name) => console.log(`[PLUGIN] Удалён: ${name}`));

const loggerListener = (name) => console.log(`[PLUGIN] Зарегистрирован: ${name}`);
pm.on('log', loggerListener);
pm.emit('plugin:registered', 'LoggerPlugin');

const alertListener = (name) => console.log(`[PLUGIN] Зарегистрирован: ${name}`);
pm.on('alert', alertListener);
pm.emit('plugin:registered', 'AlertPlugin');

pm.removeListener('log', loggerListener);
pm.emit('plugin:removed', 'LoggerPlugin');

console.log('\n=== Демонстрация утечки ===');

const leak = new EventEmitter();
function dummy() {}

for (let i = 0; i < 10; i++) leak.on('leak', dummy);
console.log(`Слушателей до: ${leak.listenerCount('leak')}`);

for (let i = 0; i < 1000; i++) leak.on('leak', dummy);
console.log(`Слушателей после добавления 1000: ${leak.listenerCount('leak')}`);

leak.removeAllListeners('leak');
console.log(`Слушателей после removeAllListeners: ${leak.listenerCount('leak')}`);


console.log('\n=== Асинхронные слушатели ===');

const asyncEmitter = new EventEmitter();

asyncEmitter.on('async-event', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log('[BBMO-01-23] async-слушатель завершён через 100ms');
});

console.log('[BBMO-01-23] emit вызван (не ждёт async-слушатель)');
asyncEmitter.emit('async-event');