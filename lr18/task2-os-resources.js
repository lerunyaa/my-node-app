
const os = require('os');

const GROUP = '401';
const cpus = os.cpus();

function toGB(bytes) {
  return (bytes / (1024 ** 3)).toFixed(2);
}

console.log('=== Информация о процессоре ===');
console.log(`Количество логических ядер: ${cpus.length}`);
console.log(`Модель процессора: ${cpus[0].model.trim()}`);

let totalSpeed = 0;
cpus.forEach((cpu, index) => {
  console.log(`  Ядро ${index + 1}: ${cpu.speed} МГц`);
  totalSpeed += cpu.speed;
});

const avgSpeed = Math.round(totalSpeed / cpus.length);
console.log(`Средняя частота: ${avgSpeed} МГц`);

const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const usedPercent = (usedMem / totalMem * 100).toFixed(1);
const freePercent = (freeMem / totalMem * 100).toFixed(1);

console.log('\n=== Информация о памяти ===');
console.log(`Общий объём: ${toGB(totalMem)} ГБ`);
console.log(`Свободно: ${toGB(freeMem)} ГБ`);
console.log(`Использовано: ${toGB(usedMem)} ГБ (${usedPercent}%)`);

console.log('\n=== Средняя загрузка (1/5/15 мин) ===');
const load = os.loadavg();

if (os.platform() === 'win32') {
  console.log('Загрузка недоступна для Windows (показывает 0.00)');
}
console.log(`Load Average: ${load.map(n => n.toFixed(2)).join(' / ')}`);

console.log(`\nГруппа: ${GROUP}`);

// Предупреждение, если свободной памяти меньше 20%
if (parseFloat(freePercent) < 20) {
  console.log('⚠ ВНИМАНИЕ: Свободной памяти меньше 20%!');
  console.log('Память критически заполнена');
} else {
  console.log('Память в норме');
}