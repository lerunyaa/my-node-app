const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs.txt');

function writeLog(event, data) {
  const time = new Date().toISOString();
  const line = `[${time}] ${event}: ${JSON.stringify(data)}\n`;

  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) {
      console.error('Ошибка записи в лог:', err.message);
    }
  });
}

function setupLogger(app) {
  app.on('server:started', (port) => {
    writeLog('server:started', { port });
  });

  app.on('server:stopped', () => {
    writeLog('server:stopped', {});
  });

  app.on('request:received', (data) => {
    writeLog('request:received', data);
  });
}

module.exports = { setupLogger };