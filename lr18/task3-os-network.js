const os = require('os');

const GROUP = '401'; 

function maskMac(mac) {
  if (!mac || mac === '00:00:00:00:00:00') return mac;
  const parts = mac.split(':');
  if (parts.length === 6) {
    return `${parts[0]}:${parts[1]}:${parts[2]}:**:**:**`;
  }
  return mac;
}

console.log('=== Сетевые интерфейсы ===');
const nets = os.networkInterfaces();
let mainInterface = null;

for (const [name, addresses] of Object.entries(nets)) {
  const ipv4 = addresses.find(a => a.family === 'IPv4' && !a.internal);
  
  if (ipv4) {
    console.log(`Интерфейс: ${name}`);
    console.log(`  IPv4: ${ipv4.address}`);
    console.log(`  MAC: ${maskMac(ipv4.mac)}`);
    console.log(`  Внутренний: ${ipv4.internal ? 'да' : 'нет'}`);
    
    // Первый найденный внешний считаем основным
    if (!mainInterface) {
      mainInterface = { name, ip: ipv4.address };
    }
  }
}

console.log(`\nВсего интерфейсов (активных): ${Object.keys(nets).length}`);
if (mainInterface) {
  console.log(`Основной интерфейс: ${mainInterface.name} (${mainInterface.ip})`);
}

console.log('\n=== Информация о пользователе ===');
const user = os.userInfo();
console.log(`Имя пользователя: ${user.username}`);
console.log(`UID: ${user.uid}`);
console.log(`GID: ${user.gid}`);
console.log(`Домашняя директория: ${user.homedir}`);
console.log(`Оболочка: ${user.shell || 'N/A'}`);

console.log(`\nГруппа: ${GROUP}`);
if (user.username === 'root') {
  console.log('⚠ Проверка root: ДА (Вы работаете под root!)');
} else {
  console.log('Проверка root: нет');
}