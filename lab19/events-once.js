const { EventEmitter } = require('events');

const emitter = new EventEmitter();

console.log('=== Сравнение on и once ===');

let onCount = 0;
let onceCount = 0;

emitter.on('tick', () => {
  onCount++;
  console.log(`[tick #${onCount}] on-слушатель`);
});

emitter.once('tick', () => {
  onceCount++;
  console.log(`[tick #${onCount}] once-слушатель`);
});

for (let i = 0; i < 3; i++) emitter.emit('tick');

console.log(`on-слушатель вызван: ${onCount} раза`);
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('\n=== Управление подписками ===');

function listenerA() {}
function listenerB() {}
function listenerC() {}

emitter.on('manage', listenerA);
emitter.on('manage', listenerB);
emitter.on('manage', listenerC);

console.log(`Слушателей до удаления: ${emitter.listenerCount('manage')}`);
emitter.removeListener('manage', listenerB);
console.log(`Слушателей после удаления одного: ${emitter.listenerCount('manage')}`);
emitter.removeAllListeners('manage');
console.log(`Слушателей после removeAllListeners: ${emitter.listenerCount('manage')}`);

console.log('\n=== Порядок вызова ===');

emitter.on('order', () => console.log('1. Первый слушатель (группа ББМО-01-23)'));
emitter.on('order', () => console.log('2. Второй слушатель'));
emitter.on('order', () => console.log('3. Третий слушатель'));

emitter.emit('order');