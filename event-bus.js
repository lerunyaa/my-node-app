const EventEmitter = require('events');
const http = require('http');
const os = require('os');

const GROUP = 'ББМО-01-23';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this._listenersMap = new Map();
    this.anyListeners = [];
    this.metrics = new Map();
    this.totalEvents = 0;

    this.on('error', (err) => {
      console.log(`[ERROR] [${GROUP}] ${err.message}`);
    });
  }

  on(event, listener, priority = 0) {
    if (!this._listenersMap.has(event)) this._listenersMap.set(event, []);
    this._listenersMap.get(event).push({ listener, priority });
    this._listenersMap.get(event).sort((a, b) => b.priority - a.priority);
    return this;
  }

  once(event, listener, priority = 0) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper, priority);
  }

  onAny(listener) {
    this.anyListeners.push(listener);
    return this;
  }

  off(event, listener) {
    const arr = this._listenersMap.get(event) || [];
    this._listenersMap.set(
      event,
      arr.filter((x) => x.listener !== listener)
    );
    return this;
  }

  emit(event, ...args) {
    const current = this.metrics.get(event) || { count: 0, lastTime: null };
    current.count++;
    current.lastTime = new Date().toISOString();
    this.metrics.set(event, current);
    this.totalEvents++;

    this.anyListeners.forEach((l) => {
      try {
        l(event, args);
      } catch (e) {
        console.log(`[ERROR] [${GROUP}] Ошибка в onAny: ${e.message}`);
      }
    });

    const arr = this._listenersMap.get(event) || [];
    arr.forEach(({ listener }) => {
      try {
        listener(...args);
      } catch (e) {
        console.log(`[ERROR] [${GROUP}] Ошибка в слушателе "${event}": ${e.message}`);
      }
    });

    return arr.length > 0;
  }

  getMetrics() {
    const events = {};
    for (const [k, v] of this.metrics) events[k] = v.count;
    const listeners = {};
    for (const [k, v] of this._listenersMap) listeners[k] = v.length;
    return { group: GROUP, events, total: this.totalEvents, listeners };
  }
}

const bus = new EventBus();

console.log(`=== EventBus (группа ${GROUP}) ===`);
console.log('--- Приоритеты ---');
bus.on('priority', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('priority', () => console.log('[priority 5] Средний приоритет'), 5);
bus.on('priority', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.emit('priority');

console.log('--- Wildcard ---');
bus.onAny((event, args) => {
  console.log(`[onAny] Событие "${event}" с аргументами: ${JSON.stringify(args)}`);
});
bus.emit('greet', 'Иван');
bus.emit('info', GROUP);

console.log('--- Once-кэш ---');
let onceCalls = 0;
bus.once('tick', () => {
  onceCalls++;
  console.log('[tick] once-слушатель вызван');
});
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log(`once-слушатель вызван: ${onceCalls} раз`);

console.log('--- Обработка ошибок ---');
bus.on('test', () => {
  throw new Error('Ошибка в test');
});
bus.on('test2', () => {
  throw new Error('Ошибка в test2');
});
bus.emit('test');
bus.emit('test2');
bus.emit('test');

console.log('--- Метрики ---');
const m = bus.getMetrics();
for (const [k, v] of Object.entries(m.events)) {
  console.log(`${k}: ${v} вызовов`);
}
console.log(`Всего событий: ${m.total}`);

const PORT = 4000;
const server = http.createServer((req, res) => {
  bus.emit('request', req.url);
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Привет от группы ${GROUP}\nOS: ${os.platform()} ${os.release()}\n`);
  }
});

server.listen(PORT, () => {
  console.log(`HTTP сервер запущен: http://localhost:${PORT}`);
  console.log(`Метрики: http://localhost:${PORT}/metrics`);
}); 
