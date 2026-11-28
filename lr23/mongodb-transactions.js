require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function run() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('students');

    console.log('=== Реплика-сет ===');
    const hello = await db.admin().command({ hello: 1 });
    if (hello.setName) {
      console.log(`✔ Реплика-сет: ${hello.setName}`);
      console.log(`✔ Primary: ${hello.primary}`);
    } else {
      console.log('✖ Это не реплика-сет (Standalone режим)');
      console.log('Транзакции и Change Streams не будут работать.');
    }

    console.log('\n=== Транзакция (успех) ===');
    const session = client.startSession();
    try {
      session.startTransaction();
      console.log('Начало транзакции');
      
      await collection.insertOne({ name: 'Студент 1', group_name: 'ББМО-01-23', course: 1 }, { session });
      console.log('✓ INSERT 1 выполнен');
      
      await collection.insertOne({ name: 'Студент 2', group_name: 'ББМО-01-23', course: 1 }, { session });
      console.log('✓ INSERT 2 выполнен');

      await session.commitTransaction();
      console.log('Транзакция зафиксирована (commit)');
    } catch (e) {
      await session.abortTransaction();
      console.log('Транзакция отменена (abort):', e.message);
    } finally {
      await session.endSession();
    }

    console.log('\n=== Change Streams ===');
    console.log('Отслеживание изменений (ждем 2 секунды)...');
    
    // Запускаем Change Stream
    const changeStream = collection.watch();
    
    // Выполняем действие, чтобы вызвать событие
    setTimeout(async () => {
      await collection.insertOne({ name: 'Студент 3', group_name: 'ББМО-01-23', course: 2 });
    }, 500);

    // Слушаем изменения
    changeStream.on('change', (change) => {
      console.log(`[CHANGE] ${change.operationType}: ${JSON.stringify(change.fullDocument)}`);
    });

    // Ждем 2 секунды и закрываем
    await new Promise(resolve => setTimeout(resolve, 2000));
    await changeStream.close();
    console.log('Stream закрыт');

  } catch (err) {
    console.error('✖ Ошибка:', err.message);
    console.log('(Скорее всего, MongoDB запущена в режиме Standalone)');
  } finally {
    await client.close();
  }
}

run(); 
