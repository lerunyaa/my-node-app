const EventEmitter = require('events');

const GROUP = 'BBMO-01-23';

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();

    this.on('newListener', (event) => {
      console.log(`[newListener] Добавлен слушатель "${event}"`);
    });

    this.on('removeListener', (event) => {
      console.log(`[removeListener] Удалён слушатель "${event}"`);
    });
  }

  registerPlugin(name) {
    this.plugins.set(name, true);
    this.emit('plugin:registered', name);
    console.log(`[PLUGIN] Зарегистрирован: ${name}`);
  }

  removePlugin(name) {
    const exists = this.plugins.get(name);
    this.plugins.delete(name);
    if (exists) {
      this.emit('plugin:removed', name);
      console.log(`[PLUGIN] Удалён: ${name}`);
    }
  }
}

console.log('=== Система плагинов ===');
const pm = new PluginManager();

pm.on('plugin:registered', (name) => {
  console.log(`  -> plugin:registered: ${name}`);
});
pm.on('plugin:removed', (name) => {
  console.log(`  -> plugin:removed: ${name}`);
});

pm.registerPlugin('LoggerPlugin');
pm.registerPlugin('AlertPlugin');

const logListener = () => {};
pm.on('log', logListener);
pm.removeListener('log', logListener);

pm.removePlugin('LoggerPlugin');

console.log('=== Демонстрация утечки ===');
const leakEmitter = new EventEmitter();
const leakListener = () => {};

leakEmitter.on('leak', leakListener);
console.log(`Слушателей до: ${leakEmitter.listenerCount('leak')}`);

for (let i = 0; i < 1000; i++) {
  leakEmitter.on('leak', leakListener);
}
console.log(`Слушателей после добавления 1000: ${leakEmitter.listenerCount('leak')}`);

leakEmitter.removeAllListeners('leak');
console.log(`Слушателей после removeAllListeners: ${leakEmitter.listenerCount('leak')}`);

console.log('=== Асинхронные слушатели ===');
const asyncEmitter = new EventEmitter();

asyncEmitter.on('async', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log(`[${GROUP}] async-слушатель завершён через 100ms`);
});

console.log(`[${GROUP}] emit вызван (не ждёт async-слушатель)`);
asyncEmitter.emit('async');

setImmediate(() => {
  console.log(`[${GROUP}] setImmediate: emit уже завершился`);
}); 
