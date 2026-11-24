const EventEmitter = require('events');
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
  console.log(`[tick #${onceCount}] once-слушатель`);
});

emitter.emit('tick');
emitter.emit('tick');
emitter.emit('tick');

console.log(`on-слушатель вызван: ${onCount} раза`);
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('\n=== Управление подписками ===');

const listenerA = () => console.log('A');
const listenerB = () => console.log('B');
const listenerC = () => console.log('C');

emitter.on('data', listenerA);
emitter.on('data', listenerB);
emitter.on('data', listenerC);

console.log(`Слушателей до удаления: ${emitter.listenerCount('data')}`);

emitter.removeListener('data', listenerB);
console.log(`Слушателей после удаления одного: ${emitter.listenerCount('data')}`);

emitter.removeAllListeners('data');
console.log(`Слушателей после removeAllListeners: ${emitter.listenerCount('data')}`);

console.log('\n=== Порядок вызова ===');

emitter.on('order', () => console.log('1. Первый слушатель (группа ББМО-01-23)'));
emitter.on('order', () => console.log('2. Второй слушатель'));
emitter.on('order', () => console.log('3. Третий слушатель'));

emitter.emit('order');