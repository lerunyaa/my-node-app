 
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const GROUP = 'ББМО-01-23';

async function run() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('students');

    // Очищаем коллекцию перед началом
    await collection.deleteMany({});
    console.log(`=== Коллекция students (группа ${GROUP}) ===`);

    // Создаем индекс по group_name
    await collection.createIndex({ group_name: 1 });

    // 1. INSERT (Вставка)
    console.log('\n--- INSERT ---');
    const insertOneResult = await collection.insertOne({
      name: 'Иван',
      group_name: GROUP,
      course: 2,
      grade: 4.5,
      created_at: new Date()
    });
    console.log(`✔ Вставлен: insertedId=${insertOneResult.insertedId}`);

    const insertManyResult = await collection.insertMany([
      { name: 'Мария', group_name: GROUP, course: 2, grade: 3.8, created_at: new Date() },
      { name: 'Петр', group_name: GROUP, course: 3, grade: 2.5, created_at: new Date() },
      { name: 'Анна', group_name: 'ББМО-02-23', course: 1, grade: 4.0, created_at: new Date() }
    ]);
    console.log(`✔ Вставлено 3 документа: insertedIds=${Object.values(insertManyResult.insertedIds)}`);

    // 2. SELECT (Поиск)
    console.log('\n--- SELECT ---');
    
    // Все документы
    const allDocs = await collection.find({}).toArray();
    console.log(`Все документы (${allDocs.length}):`);
    allDocs.forEach(d => console.log(`{ _id: ${d._id}, name: "${d.name}", group: "${d.group_name}", grade: ${d.grade} }`));

    // С фильтром
    const filterDocs = await collection.find({ group_name: GROUP }).toArray();
    console.log(`\nС фильтром по группе (${filterDocs.length}):`);
    filterDocs.forEach(d => console.log(`{ name: "${d.name}", group: "${d.group_name}", grade: ${d.grade} }`));

    // С проекцией (только name и grade)
    const projectionDocs = await collection.find({}, { projection: { name: 1, grade: 1, _id: 0 } }).toArray();
    console.log(`\nС проекцией (только name, grade):`);
    projectionDocs.forEach(d => console.log(`{ name: "${d.name}", grade: ${d.grade} }`));

    // 3. UPDATE (Обновление)
    console.log('\n--- UPDATE ---');
    const updateOneResult = await collection.updateOne(
      { name: 'Иван' },
      { $set: { grade: 4.8 } }
    );
    console.log(`✔ updateOne: matchedCount=${updateOneResult.matchedCount}, modifiedCount=${updateOneResult.modifiedCount}`);

    const updateManyResult = await collection.updateMany(
      { group_name: GROUP },
      { $inc: { course: 1 } } // Увеличиваем курс на 1
    );
    console.log(`✔ updateMany (group=${GROUP}, $inc: course+1): matchedCount=${updateManyResult.matchedCount}`);

    // 4. DELETE (Удаление)
    console.log('\n--- DELETE ---');
    const deleteOneResult = await collection.deleteOne({ name: 'Анна' });
    console.log(`✔ deleteOne: deletedCount=${deleteOneResult.deletedCount}`);

    const deleteManyResult = await collection.deleteMany({ grade: { $lt: 3 } });
    console.log(`✔ deleteMany (grade < 3): deletedCount=${deleteManyResult.deletedCount}`);

  } catch (err) {
    console.error('✖ Ошибка:', err.message);
  } finally {
    await client.close();
  }
}

run();