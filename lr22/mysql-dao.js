require('dotenv').config();
const mysql = require('mysql2/promise');

const GROUP = 'ББМО-01-23';

class StudentDAO {
  constructor(pool) {
    this.pool = pool;
  }

  // Валидация данных перед записью
  validate(data) {
    if (!data.name || data.name.length < 2 || data.name.length > 100) {
      throw new Error('name слишком короткое (мин. 2 символа)');
    }
    const groupRegex = /^ББМО-\d{2}-\d{2}$/;
    if (!data.group_name || !groupRegex.test(data.group_name)) {
      throw new Error('group_name не соответствует формату ББМО-ХХ-ХХ');
    }
    if (data.course && (data.course < 1 || data.course > 4)) {
      throw new Error('course должен быть от 1 до 4');
    }
    if (data.grade && (data.grade < 0 || data.grade > 5)) {
      throw new Error('grade должен быть от 0 до 5');
    }
    return true;
  }

  // Создание студента
  async create(data) {
    this.validate(data);
    const [result] = await this.pool.query(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      [data.name, data.group_name, data.course || 1, data.grade || null]
    );
    console.log(`✓ Создан: id=${result.insertId}, name=${data.name}`);
  }

  // Пагинация (вывод по частям)
  async findAll(options) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    
    // Получаем общее количество для метаданных
    const [countResult] = await this.pool.query('SELECT COUNT(*) as total FROM students');
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    const [rows] = await this.pool.query(
      'SELECT * FROM students LIMIT ? OFFSET ?', 
      [limit, offset]
    );
    
    console.log(`\nfindAll({ limit: ${limit}, offset: ${offset} }):`);
    console.log(`Всего: ${total}, Страница: ${offset / limit + 1}/${pages || 1}`);
    rows.forEach(r => console.log(`id=${r.id}, name=${r.name}, group=${r.group_name}, grade=${r.grade}`));
  }

  // Поиск по имени
  async search(query) {
    const [rows] = await this.pool.query(
      'SELECT * FROM students WHERE name LIKE ?',
      [`%${query}%`]
    );
    console.log(`\nsearch('${query}'):`);
    console.log(`Найдено: ${rows.length} студентов`);
    rows.forEach(r => console.log(`id=${r.id}, name=${r.name}`));
  }

  // Статистика
  async getStats() {
    // Общая статистика
    const [rows] = await this.pool.query(`
      SELECT COUNT(*) as total, AVG(grade) as avgGrade, MIN(grade) as minGrade, MAX(grade) as maxGrade 
      FROM students
    `);
    const s = rows[0];
    
    // Количество по группам
    const [groups] = await this.pool.query(`
      SELECT group_name, COUNT(*) as count FROM students GROUP BY group_name
    `);

    console.log('\n--- Статистика ---');
    console.log(`Всего студентов: ${s.total}`);
    console.log(`Средний балл: ${s.avgGrade ? parseFloat(s.avgGrade).toFixed(2) : 0}`);
    console.log(`Минимальная оценка: ${s.minGrade || 0}`);
    console.log(`Максимальная оценка: ${s.maxGrade || 0}`);
    console.log('По группам:');
    groups.forEach(g => console.log(`${g.group_name}: ${g.count}`));
  }
}

async function run() {
  console.log('=== StudentDAO (группа ББМО-01-23) ===');
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const dao = new StudentDAO(pool);

  // Очищаем таблицу перед демонстрацией, чтобы было красиво
  await pool.query('TRUNCATE TABLE students');

  console.log('--- Создание с валидацией ---');
  try { await dao.create({ name: 'Иван', group_name: 'ББМО-01-23', course: 2, grade: 4.5 }); } catch (e) { console.log(`❖ Ошибка: ${e.message}`); }
  try { await dao.create({ name: 'И', group_name: 'ББМО-01-23', course: 2, grade: 4.5 }); } catch (e) { console.log(`❖ Ошибка: ${e.message}`); }
  try { await dao.create({ name: 'Петр', group_name: 'Неверная-Группа', course: 2, grade: 4.5 }); } catch (e) { console.log(`❖ Ошибка: ${e.message}`); }

  // Добавим еще пару студентов для пагинации и поиска
  await dao.create({ name: 'Мария', group_name: 'ББМО-01-23', course: 2, grade: 3.8 });
  await dao.create({ name: 'Иван Иванов', group_name: 'ББМО-01-23', course: 3, grade: 4.0 });

  console.log('\n--- Пагинация ---');
  await dao.findAll({ limit: 2, offset: 0 });

  console.log('\n--- Поиск ---');
  await dao.search('Иван');

  await dao.getStats();

  await pool.end();
}

run(); 
