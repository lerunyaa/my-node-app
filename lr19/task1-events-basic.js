const EventEmitter = require('events');
const emitter = new EventEmitter();

const GROUP = '401'; 

emitter.on('greet', (name) => {
  console.log(`[greet] Привет, ${name}!`);
});

emitter.on('info', () => {
  console.log(`[info] Группа: ${GROUP}`);
});

emitter.on('bye', () => {
  console.log('[bye] До свидания!');
});

console.log('=== Демонстрация EventEmitter ===');

emitter.emit('greet', 'Иван');
emitter.emit('info');
emitter.emit('bye');

const unknownResult = emitter.emit('unknown');
console.log(`\nСобытие "unknown" без слушателей: ${unknownResult}`);

const greetResult = emitter.emit('greet', 'Мария');
console.log(`Событие "greet" со слушателями: ${greetResult}`);