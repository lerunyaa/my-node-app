const EventEmitter = require('events');

class DB extends EventEmitter {}

const db = new DB();
console.log('Перед emit error без слушателя...');
db.emit('error', new Error('Connection timeout'));
console.log('Эта строка не выполнится'); 
