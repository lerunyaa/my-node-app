require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function run() {
  const client = new MongoClient(uri);
  
  console.log('=== Подключение к MongoDB ===');
  
  try {
    await client.connect();
    console.log('✔ Подключение установлено');

    const db = client.db(dbName);
    
    // Проверка через ping
    await db.command({ ping: 1 });
    
    // Получаем версию
    const buildInfo = await db.admin().buildInfo();
    console.log(`Версия MongoDB: ${buildInfo.version}`);
    console.log(`База данных: ${dbName}`);

    console.log('\n=== Информация о сервере ===');
    // Исправленный метод получения списка баз данных
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Список БД:');
    dbs.databases.forEach(d => console.log(`- ${d.name}`));

    // Heartbeat
    console.log('\n=== Heartbeat ===');
    client.on('serverHeartbeatSucceeded', (event) => {
      console.log(`[HEARTBEAT] Успешно: ${new Date().toISOString()}`);
    });
    
    // Ждем пару секунд для демонстрации heartbeat
    await new Promise(resolve => setTimeout(resolve, 2500));
    
  } catch (err) {
    console.error('✖ Ошибка подключения:', err.message);
    console.log('(Скорее всего, MongoDB не запущена)');
  } finally {
    await client.close();
    console.log('\n✔ Соединение закрыто');
  }
}

run();