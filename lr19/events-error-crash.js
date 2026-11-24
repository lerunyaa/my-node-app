const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.emit('error', new Error('Connection timeout'));