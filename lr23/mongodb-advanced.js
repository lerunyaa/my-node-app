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

    // Очищаем коллекцию
    await collection.deleteMany({});

    console.log('=== Курсоры ===');
    
    // Генерируем 1000 документов для демонстрации
    const docs = [];
    for (let i = 1; i <= 1000; i++) {
      docs.push({
        name: `Студент ${i}`,
        group_name: i % 2 === 0 ? 'ББМО-01-23' : 'ББМО-02-23',
        course: (i % 4) + 1,
        grade: (Math.random() * 3 + 2).toFixed(1) // оценки 2.0 - 5.0
      });
    }
    await collection.insertMany(docs);
    console.log(`✔ Сгенерировано 1000 документов`);

    // Итерация через for await (безопасно для памяти)
    console.log('\nИтерация через for await:');
    const start = Date.now();
    let count = 0;
    const cursor = collection.find({}).batchSize(100);
    
    for await (const doc of cursor) {
      count++;
    }
    const duration = Date.now() - start;
    console.log(`Получено ${count} документов за ${duration} мс`);

    console.log('\n=== Агрегации ===');
    
    // 1. Средний балл по группам
    console.log('Средний балл по группам:');
    const avgGrades = await collection.aggregate([
      {
        $group: {
          _id: "$group_name",
          avgGrade: { $avg: { $toDouble: "$grade" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    avgGrades.forEach(g => console.log(`${g._id}: ${g.avgGrade.toFixed(2)} (${g.count} студентов)`));

    // 2. Количество по курсам
    console.log('\nКоличество по курсам:');
    const courseCounts = await collection.aggregate([
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    courseCounts.forEach(c => console.log(`${c._id} курс: ${c.count}`));

    console.log('\n=== Индексы ===');
    
    // Создаем индексы
    await collection.createIndex({ group_name: 1 });
    console.log('✔ Создан индекс: group_name_1');
    
    await collection.createIndex({ group_name: 1, grade: -1 });
    console.log('✔ Создан индекс: group_name_1_grade_-1');

    // Проверка explain (без индекса и с индексом)
    console.log('\nПроверка explain():');
    
    // Запрос без индекса (по имени)
    const explainNoIndex = await collection.find({ name: 'Студент 500' }).explain('executionStats');
    console.log(`Без индекса: executionTimeMillis=${explainNoIndex.executionStats.executionTimeMillis}, totalDocsExamined=${explainNoIndex.executionStats.totalDocsExamined}`);
    
    // Запрос с индексом (по group_name)
    const explainWithIndex = await collection.find({ group_name: 'ББМО-01-23' }).explain('executionStats');
    console.log(`С индексом: executionTimeMillis=${explainWithIndex.executionStats.executionTimeMillis}, totalDocsExamined=${explainWithIndex.executionStats.totalDocsExamined}`);

    console.log('\n=== Текстовый поиск ===');
    
    // Создаем текстовый индекс
    await collection.createIndex({ name: 'text' });
    console.log('✔ Создан текстовый индекс: name_text');

    // Ищем по тексту (точная фраза в кавычках, ограничение 5)
    const searchResult = await collection.find({ $text: { $search: '"Студент 500"' } }).limit(5).toArray();
    console.log(`find({ $text: { $search: '"Студент 500"' } }):`);
    console.log(`Найдено: ${searchResult.length} документов (показаны первые 5)`);
    searchResult.forEach(d => console.log(`- ${d.name}`));

  } catch (err) {
    console.error('✖ Ошибка:', err.message);
  } finally {
    await client.close();
  }
}

run();