const { EventEmitter } = require('events');
const http = require('http');
const os = require('os');

class EventBus extends EventEmitter {
  constructor(group) {
    super();
    this.group = group;
    this.metrics = {}; 
    this.onAnyListeners = [];
  }

  _record(event, isError = false) {
    if (!this.metrics[event]) this.metrics[event] = { count: 0, errors: 0, lastTime: null };
    this.metrics[event].count++;
    if (isError) this.metrics[event].errors++;
    this.metrics[event].lastTime = new Date().toISOString();
  }

  on(event, listener, priority = 0) {
    listener._priority = priority;
    return super.on(event, listener);
  }

  once(event, listener, priority = 0) {
    listener._priority = priority;
    return super.once(event, listener);
  }

  onAny(listener) {
    this.onAnyListeners.push(listener);
  }

  emit(event, ...args) {
    this._record(event);

    for (const l of this.onAnyListeners) {
      try {
        l(event, args);
      } catch (e) {
        console.log(`[ERROR] [${this.group}] Ошибка в onAny: ${e.message}`);
      }
    }

    const listeners = this.listeners(event);

    const sorted = listeners
      .map((fn, idx) => ({ fn, idx, priority: fn._priority || 0 }))
      .sort((a, b) => b.priority - a.priority || a.idx - b.idx)
      .map((x) => x.fn);

    if (sorted.length === 0 && event !== 'error') {
      return false;
    }

    for (const fn of sorted) {
      try {
        fn(...args);
      } catch (e) {
        this._record(event, true);
        console.log(`[ERROR] [${this.group}] Ошибка в слушателе "${event}": ${e.message}`);
      }
    }
    return true;
  }

  getMetrics() {
    return {
      group: this.group,
      events: Object.fromEntries(Object.entries(this.metrics).map(([k, v]) => [k, v.count])),
      total: Object.values(this.metrics).reduce((s, v) => s + v.count, 0),
      listeners: Object.fromEntries(
        Object.keys(this.metrics).map((k) => [k, this.listenerCount(k)])
      ),
    };
  }
}

console.log(`=== EventBus (группа ББМО-01-23) ===`);

const bus = new EventBus('ББМО-01-23');

console.log('--- Приоритеты ---');
bus.on('greet', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('greet', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('greet', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('greet', 'Иван');

console.log('\n--- Wildcard ---');
bus.onAny((event, args) => {
  console.log(`[onAny] Событие "${event}" с аргументами: ${JSON.stringify(args)}`);
});
bus.emit('greet', 'Иван');
bus.emit('info', 'ББМО-01-23');

console.log('\n--- Once-кэш ---');
let onceCalls = 0;
bus.once('tick', () => { onceCalls++; });
for (let i = 1; i <= 3; i++) {
  console.log(`[tick] Вызов ${i}`);
  bus.emit('tick');
}
console.log(`once-слушатель вызван: ${onceCalls} раз`);

console.log('\n--- Обработка ошибок ---');
bus.on('test', () => { throw new Error('boom'); });
bus.on('test2', () => { throw new Error('boom2'); });
bus.emit('test');
bus.emit('test');
bus.emit('test2');

console.log('\n--- Метрики ---');
const m = bus.getMetrics();
for (const [ev, cnt] of Object.entries(m.events)) {
  const err = bus.metrics[ev].errors;
  console.log(`${ev}: ${cnt} вызова${err ? ` (${err} ошибка)` : ''}`);
}
console.log(`Всего событий: ${m.total}`);

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    bus.emit('request'); // Эмитим событие запроса
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('\nHTTP сервер слушает http://localhost:3000/metrics');
  console.log(`[os] Платформа: ${os.platform()}, CPU: ${os.cpus().length}, Память: ${Math.round(os.totalmem() / 1e9)} GB`);
});