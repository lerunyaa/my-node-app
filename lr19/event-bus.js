const EventEmitter = require('events');
const os = require('os');
const http = require('http');

const GROUP = 'ББМО-01-23';

class EventBus extends EventEmitter {
  constructor(group) {
    super();
    this.group = group;
    this.metrics = {};
    this.anyListeners = [];
    this.on('error', () => {}); // заглушка, чтобы не падать
  }

  _recordMetric(event, isError = false) {
    if (!this.metrics[event]) {
      this.metrics[event] = { count: 0, errors: 0, lastCall: null };
    }
    this.metrics[event].count++;
    if (isError) this.metrics[event].errors++;
    this.metrics[event].lastCall = new Date().toISOString();
  }

  on(event, listener, priority = 0) {
    listener._priority = priority;
    super.on(event, listener);
    return this;
  }

  once(event, listener, priority = 0) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      listener(...args);
    };
    wrapped._priority = priority;
    super.on(event, wrapped);
    return this;
  }

  onAny(listener) {
    this.anyListeners.push(listener);
  }

  off(event, listener) {
    super.removeListener(event, listener);
    return this;
  }

  emit(event, ...args) {
    this._recordMetric(event);

    // Wildcard: вызываем onAny-слушатели
    for (const l of this.anyListeners) {
      try {
        l(event, args);
      } catch (e) {
        console.error(`[ERROR] [${GROUP}] ошибка в onAny: ${e.message}`);
      }
    }

    // Сортируем по приоритету (по убыванию)
    const listeners = this.listeners(event);
    const sorted = [...listeners].sort(
      (a, b) => (b._priority || 0) - (a._priority || 0)
    );

    for (const l of sorted) {
      try {
        l(...args);
      } catch (e) {
        this._recordMetric(event, true);
        console.error(`[ERROR] [${GROUP}] Ошибка в слушателе "${event}": ${e.message}`);
      }
    }

    // Возвращаем true, если были слушатели
    return sorted.length > 0;
  }

  getMetrics() {
    const total = Object.values(this.metrics).reduce((s, m) => s + m.count, 0);
    const listeners = {};
    for (const ev of Object.keys(this.metrics)) {
      listeners[ev] = this.listenerCount(ev);
    }
    return {
      group: this.group,
      events: Object.fromEntries(
        Object.entries(this.metrics).map(([k, v]) => [k, v.count])
      ),
      total,
      listeners,
    };
  }
}

// ============ Демонстрация ============
const bus = new EventBus(GROUP);

console.log(`=== EventBus (группа ${GROUP}) ===`);

// --- Приоритеты ---
console.log('--- Приоритеты ---');
bus.on('priority', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.on('priority', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('priority', () => console.log('[priority 5] Средний приоритет'), 5);
bus.emit('priority');

// --- Wildcard ---
console.log('--- Wildcard ---');
bus.onAny((event, args) => {
  console.log(`[onAny] Событие "${event}" с аргументами: ${JSON.stringify(args)}`);
});

bus.emit('greet', 'Иван');
bus.emit('info', GROUP);

// --- Once-кэш ---
console.log('--- Once-кэш ---');
let onceCount = 0;
bus.once('tick', () => { onceCount++; console.log(`[tick] Вызов ${onceCount}`); });
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log(`once-слушатель вызван: ${onceCount} раз`);

// --- Обработка ошибок ---
console.log('--- Обработка ошибок ---');
bus.on('test', () => { throw new Error('Тестовая ошибка 1'); }, 10);
bus.on('test', () => { throw new Error('Тестовая ошибка 2'); }, 5);
bus.on('test2', () => { throw new Error('Ещё ошибка'); });
bus.emit('test');
bus.emit('test2');

// --- Метрики ---
console.log('--- Метрики ---');
const m = bus.getMetrics();
for (const [ev, c] of Object.entries(m.events)) {
  const errs = bus.metrics[ev].errors;
  console.log(`${ev}: ${c} вызовов${errs ? ` (${errs} ошибок)` : ''}`);
}
console.log(`Всего событий: ${m.total}`);

// --- HTTP-сервер ---
const server = http.createServer((req, res) => {
  bus.emit('request', req.url);
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bus.getMetrics(), null, 2));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`OK: ${req.url}\n`);
  }
});

server.listen(3000, () => {
  console.log('\nСервер слушает http://localhost:3000');
  console.log('Открой в браузере: http://localhost:3000/metrics');
  console.log(`Платформа: ${os.platform()}, CPU: ${os.cpus().length} ядер`);
});