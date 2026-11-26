const EventEmitter = require('events');

const emitter = new EventEmitter();

console.log('=== Демонстрация EventEmitter ===');

emitter.on('greet', (name) => {
  console.log(`[greet] Привет, ${name}!`);
});

emitter.on('info', (group) => {
  console.log(`[info] Группа: ${group}`);
});

emitter.on('bye', () => {
  console.log('[bye] До свидания!');
});

emitter.emit('greet', 'Иван');
emitter.emit('info', 'ББМО-01-23');
emitter.emit('bye');

const unknownResult = emitter.emit('unknown');
console.log(`Событие "unknown" без слушателей: ${unknownResult}`);

const greetResult = emitter.emit('greet', 'Иван');
console.log(`Событие "greet" со слушателями: ${greetResult}`); 
