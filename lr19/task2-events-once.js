const EventEmitter = require('events');
const emitter = new EventEmitter();
const GROUP = '401';

console.log('=== Сравнение on и once ===');

let onCount = 0;
let onceCount = 0;

emitter.on('tick', (n) => {
  onCount++;
  console.log(`[tick #${n}] on-слушатель (вызов ${onCount})`);
});

emitter.once('tick', (n) => {
  onceCount++;
  console.log(`[tick #${n}] once-слушатель (вызов ${onceCount})`);
});

emitter.emit('tick', 1);
emitter.emit('tick', 2);
emitter.emit('tick', 3);

console.log(`\non-слушатель вызван: ${onCount} раз`);
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('\n=== Управление подписками ===');

const e2 = new EventEmitter();

const l1 = () => console.log('  Слушатель 1');
const l2 = () => console.log('  Слушатель 2');
const l3 = () => console.log('  Слушатель 3');

e2.on('demo', l1);
e2.on('demo', l2);
e2.on('demo', l3);

console.log(`Слушателей до удаления: ${e2.listenerCount('demo')}`);
console.log(`Список: ${e2.listeners('demo').length} функций`);

e2.removeListener('demo', l2);
console.log(`Слушателей после removeListener: ${e2.listenerCount('demo')}`);

e2.removeAllListeners('demo');
console.log(`Слушателей после removeAllListeners: ${e2.listenerCount('demo')}`);

console.log('\n=== Порядок вызова ===');
const e3 = new EventEmitter();

e3.on('order', () => console.log(`1. Первый слушатель (группа ${GROUP})`));
e3.on('order', () => console.log('2. Второй слушатель'));
e3.on('order', () => console.log('3. Третий слушатель'));

e3.emit('order');