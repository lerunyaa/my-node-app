const EventEmitter = require('events');

const PREFIX = '[BBMO-01-23]';

console.log('=== Система плагинов ===');

class PluginManager extends EventEmitter {
  constructor() {
    super();
    // Слушаем newListener и removeListener
    this.on('newListener', (event, listener) => {
      console.log(`[newListener] Добавлен слушатель "${event}"`);
    });
    this.on('removeListener', (event, listener) => {
      console.log(`[removeListener] Удалён слушатель "${event}"`);
    });
  }

  registerPlugin(name, eventName) {
    const handler = () => {};
    this.on(eventName, handler);
    this.emit('plugin:registered', name);
    return handler;
  }

  removePlugin(name, eventName, handler) {
    this.removeListener(eventName, handler);
    this.emit('plugin:removed', name);
  }
}

const pm = new PluginManager();

pm.on('plugin:registered', (name) => {
  console.log(`[PLUGIN] Зарегистрирован: ${name}`);
});
pm.on('plugin:removed', (name) => {
  console.log(`[PLUGIN] Удалён: ${name}`);
});

const logHandler = pm.registerPlugin('LoggerPlugin', 'log');
pm.registerPlugin('AlertPlugin', 'alert');

pm.removePlugin('LoggerPlugin', 'log', logHandler);

console.log('\n=== Демонстрация утечки ===');

const leakEmitter = new EventEmitter();
leakEmitter.setMaxListeners(2000); // чтобы не было Warning при 1000+ слушателях
const baseHandler = () => {};

for (let i = 0; i < 10; i++) {
  leakEmitter.on('leak', baseHandler);
}
console.log(`Слушателей до: ${leakEmitter.listenerCount('leak')}`);

for (let i = 0; i < 1000; i++) {
  leakEmitter.on('leak', () => {});
}
console.log(`Слушателей после добавления 1000: ${leakEmitter.listenerCount('leak')}`);

leakEmitter.removeAllListeners('leak');
console.log(`Слушателей после removeAllListeners: ${leakEmitter.listenerCount('leak')}`);

console.log('\n=== Асинхронные слушатели ===');

const asyncEmitter = new EventEmitter();

asyncEmitter.on('async', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log(`${PREFIX} async-слушатель завершён через 100ms`);
});

console.log(`${PREFIX} emit вызван (не ждёт async-слушатель)`);
asyncEmitter.emit('async');
console.log(`${PREFIX} синхронный код после emit выполнился сразу`);

setImmediate(() => {
  console.log(`${PREFIX} setImmediate: проверка завершения`);
});