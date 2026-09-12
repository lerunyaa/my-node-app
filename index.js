const http = require('http');

// Вычисление числа Пи методом Нилакантхи
// Формула: π = 3 + 4/(2·3·4) − 4/(4·5·6) + 4/(6·7·8) − ...
function calculatePi(precision) {
  let pi = 3;
  let sign = 1;
  let n = 2;
  for (let i = 0; i < precision; i++) {
    pi += sign * (4 / (n * (n + 1) * (n + 2)));
    sign *= -1;
    n += 2;
  }
  return pi.toFixed(precision);
}

const studentInfo = {
  fullName: 'Какулина Валерия Александровна',   
  group: '401',                     
  journalNumber: 7,                  
};

const piValue = calculatePi(studentInfo.journalNumber);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>${studentInfo.fullName}</h1>
    <h2>Группа: ${studentInfo.group}</h2>
    <h2>Число Пи: ${piValue}</h2>
  `);
});

server.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});