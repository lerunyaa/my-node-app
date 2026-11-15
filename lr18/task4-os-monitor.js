const os = require('os');
const fs = require('fs');
const path = require('path');

const GROUP = '401'; 
const LOG_FILE = path.join(__dirname, 'monitor.log');

function logAnomaly(message) {
  const now = new Date();
  const time = now.toISOString().replace('T', ' ').slice(0, 19);
  const line = `[${time}] [${GROUP}] Предупреждение: ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

function getCpuTimes() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  });
  return { idle, total };
}

let prevCpu = getCpuTimes();
let warnings = 0;

console.log('=== Первичный сбор данных ===');
console.log(`Платформа: ${os.platform()}`);
console.log(`Память: ${(os.totalmem() / (1024**3)).toFixed(2)} ГБ`);
console.log(`Мониторинг (группа ${GROUP}). Ctrl+C для выхода.`);

setTimeout(() => {
  process.stdout.write('\n'); 
}, 1500);

const timer = setInterval(() => {
  const currentCpu = getCpuTimes();
  const idleDiff = currentCpu.idle - prevCpu.idle;
  const totalDiff = currentCpu.total - prevCpu.total;
  
  prevCpu = currentCpu; 
  
  const busyDiff = totalDiff - idleDiff;
  const cpuLoad = (busyDiff / totalDiff * 100).toFixed(1);
  
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const freePercent = (freeMem / totalMem * 100).toFixed(1);
  const usedPercent = (100 - freePercent).toFixed(1);

  process.stdout.write(`\rCPU: ${cpuLoad}% | RAM: ${usedPercent}% (${(freeMem / 1024**3).toFixed(2)} ГБ свободно)   `);

  if (parseFloat(cpuLoad) > 80) {
    logAnomaly(`Критическая загрузка CPU > 80% (${cpuLoad}%)`);
    warnings++;
  } else if (parseFloat(cpuLoad) > 50) {
    logAnomaly(`Повышенная загрузка CPU > 50% (${cpuLoad}%)`);
    warnings++;
  }
  
  if (parseFloat(freePercent) < 10) {
    logAnomaly(`Критически мало RAM: ${freePercent}% свободно`);
    warnings++;
  }
}, 2000);

process.on('SIGINT', () => {
  clearInterval(timer);
  console.log(`\n\nМониторинг остановлен. Предупреждений: ${warnings}`);
  process.exit(0);
});