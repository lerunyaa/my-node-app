const EventEmitter = require('events');
const GROUP = '401'; 
const PREFIX = `[${GROUP}]`;

class PluginManager extends EventEmitter {
  constructor() {
    super();
    // Слушаем добавление слушателей
    this.on('newListener', (event, listener) => {
      if (event !== 'newListener' && event !== 'removeListener') {
        console.log(`[newListener] Добавлен слушатель "${event}"`);
      }
    });
    // Слушаем удаление слушателей
    this.on('removeListener', (event, listener) => {
      if (event !== 'newListener' && event !== 'removeListener') {
        console.log(`[removeListener] Удалён слушатель "${event}"`);
      }
    });
  }

  registerPlugin(name, events) {
    events.forEach(event => {
      this.on(event, () => {
        console.log(`[PLUGIN] ${name} обрабатывает "${event}"`);
      });
    });
    console.log(`[PLUGIN] Зарегистрирован: ${name}`);
    this.emit('plugin:registered', name);
  }

  removePlugin(name, events) {
    events.forEach(event => {
      this.removeAllListeners(event);
    });
    console.log(`[PLUGIN] Удалён: ${name}`);
    this.emit('plugin:removed', name);
  }
}

console.log('=== Система плагинов ===');
const manager = new PluginManager();

manager.registerPlugin('LoggerPlugin', ['log']);
manager.registerPlugin('AlertPlugin', ['alert']);
manager.removePlugin('LoggerPlugin', ['log']);

console.log('\n=== Демонстрация утечки ===');
const leaky = new EventEmitter();

function dummyListener() {}

for (let i = 0; i < 10; i++) leaky.on('leak', dummyListener);
console.log(`Слушателей до: ${leaky.listenerCount('leak')}`);

for (let i = 0; i < 1000; i++) leaky.on('leak', dummyListener);
console.log(`Слушателей после добавления 1000: ${leaky.listenerCount('leak')}`);

leaky.removeAllListeners('leak');
console.log(`Слушателей после removeAllListeners: ${leaky.listenerCount('leak')}`);

console.log('\n=== Асинхронные слушатели ===');
const asyncEmitter = new EventEmitter();

asyncEmitter.on('async', async (data) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`${PREFIX} async-слушатель завершён через 100ms`);
});

console.log(`${PREFIX} emit вызван (не ждёт async-слушатель)`);
asyncEmitter.emit('async', 'test');

setTimeout(() => {
  console.log('\nВсе демонстрации завершены.');
}, 200);