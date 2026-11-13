const EventEmitter = require('events');
const http = require('http');
const os = require('os');

const GROUP = '401'; 
const PORT = 3000;

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.priorityListeners = new Map();
    this.anyListeners = [];
    this.metrics = {};
  }

  on(event, listener, priority = 0) {
    if (!this.priorityListeners.has(event)) {
      this.priorityListeners.set(event, []);
    }
    this.priorityListeners.get(event).push({ listener, priority });
    this.priorityListeners.get(event).sort((a, b) => b.priority - a.priority);
    return this;
  }

  once(event, listener, priority = 0) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    wrapper._original = listener;
    return this.on(event, wrapper, priority);
  }

  off(event, listener) {
    if (!this.priorityListeners.has(event)) return this;
    const list = this.priorityListeners.get(event);
    const index = list.findIndex(item => item.listener === listener || item.listener._original === listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
    return this;
  }

  onAny(listener) {
    this.anyListeners.push(listener);
    return this;
  }

  emit(event, ...args) {
    // Метрики
    if (!this.metrics[event]) this.metrics[event] = 0;
    this.metrics[event]++;

    this.anyListeners.forEach(l => {
      try {
        l(event, args);
      } catch (err) {
        if (event !== 'error') this.emit('error', err, event);
      }
    });

    if (this.priorityListeners.has(event)) {
      const list = [...this.priorityListeners.get(event)];
      list.forEach(item => {
        try {
          item.listener(...args);
        } catch (err) {
          if (event !== 'error') this.emit('error', err, event);
        }
      });
    }
    return true;
  }

  getMetrics() {
    const listenersCount = {};
    for (const [event, list] of this.priorityListeners) {
      listenersCount[event] = list.length;
    }
    return {
      group: GROUP,
      events: this.metrics,
      total: Object.values(this.metrics).reduce((sum, c) => sum + c, 0),
      listeners: listenersCount
    };
  }
}

const bus = new EventBus();
console.log(`=== EventBus (группа ${GROUP}) ===`);

bus.on('error', (err, eventName) => {
  console.log(`[ERROR] [${GROUP}] Ошибка в слушателе "${eventName}": ${err.message}`);
}, 100);

console.log('\n--- Приоритеты ---');
bus.on('test-priority', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('test-priority', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('test-priority', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('test-priority');

console.log('\n--- Wildcard ---');
bus.onAny((event, args) => {
  console.log(`[onAny] Событие "${event}" с аргументами: ${JSON.stringify(args)}`);
});
bus.emit('greet', 'Иван');
bus.emit('info', GROUP);

console.log('\n--- Once-кэш ---');
let tickCount = 0;
bus.on('tick', () => { tickCount++; console.log(`[tick] Вызов ${tickCount}`); });
bus.once('tick', () => console.log('[tick] once-слушатель сработал!'));
bus.emit('tick'); bus.emit('tick'); bus.emit('tick');
console.log('once-слушатель вызван: 1 раз');

console.log('\n--- Обработка ошибок ---');
bus.on('test', () => { throw new Error('Тестовая ошибка 1'); });
bus.on('test', () => { throw new Error('Тестовая ошибка 2'); });
bus.emit('test');
bus.emit('test');

console.log('\n--- Метрики ---');
const m = bus.getMetrics();
for (const [event, count] of Object.entries(m.events)) {
  if (event === 'error') continue;
  console.log(`${event}: ${count} вызовов`);
}
console.log(`Всего событий: ${m.total}`);

const server = http.createServer((req, res) => {
  bus.emit('request', req.url);
  
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else if (req.url === '/os') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      platform: os.platform(),
      memory: os.freemem(),
      uptime: os.uptime()
    }, null, 2));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('EventBus работает. Попробуйте /metrics или /os');
  }
});

server.listen(PORT, () => {
  console.log(`\nHTTP-сервер запущен: http://localhost:${PORT}`);
  console.log(`Метрики: http://localhost:${PORT}/metrics`);
});