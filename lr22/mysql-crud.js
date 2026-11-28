require('dotenv').config();
const mysql = require('mysql2/promise');

const GROUP = 'ББМО-01-23';

async function run() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  try {
    const pool = mysql.createPool({ ...config, connectionLimit: 10 });
    
    // 1. Создание таблицы
    console.log('=== Создание таблицы ===');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        group_name VARCHAR(20) NOT NULL,
        course INT NOT NULL,
        grade DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ Таблица students создана (или уже существует)');

    // Очищаем таблицу перед началом (чтобы не было дублей)
    await pool.query('TRUNCATE TABLE students');

    // 2. INSERT (Создание)
    console.log('\n=== INSERT ===');
    const [insertResult] = await pool.query(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      ['Иван', GROUP, 2, 4.50]
    );
    console.log(`✓ Вставлен студент: id=${insertResult.insertId}, affectedRows=${insertResult.affectedRows}`);

    const [multiInsert] = await pool.query(
      'INSERT INTO students (name, group_name, course, grade) VALUES ?',
      [[['Мария', GROUP, 2, 3.80], ['Петр', GROUP, 3, 4.20]]]
    );
    console.log(`✓ Вставлено 3 студента: affectedRows=${multiInsert.affectedRows}`);

    // 3. SELECT (Чтение)
    console.log('\n=== SELECT ===');
    console.log('Все студенты:');
    const [allStudents] = await pool.query('SELECT * FROM students');
    allStudents.forEach(s => console.log(`id=${s.id}, name=${s.name}, group=${s.group_name}, grade=${s.grade}`));

    console.log(`\nСтуденты группы ${GROUP} (сортировка по grade):`);
    const [sortedStudents] = await pool.query(
      'SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC',
      [GROUP]
    );
    sortedStudents.forEach(s => console.log(`id=${s.id}, name=${s.name}, grade=${s.grade}`));

    // 4. UPDATE (Обновление)
    console.log('\n=== UPDATE ===');
    const [updateResult] = await pool.query(
      'UPDATE students SET grade = ? WHERE id = ?',
      [4.80, 1]
    );
    console.log(`✓ Обновлён студент id=1: affectedRows=${updateResult.affectedRows}, changedRows=${updateResult.changedRows}`);

    const [updateResult2] = await pool.query(
      'UPDATE students SET grade = ? WHERE id = ?',
      [4.80, 1]
    );
    console.log(`✓ Повторное обновление: affectedRows=${updateResult2.affectedRows}, changedRows=${updateResult2.changedRows}`);

    // 5. DELETE (Удаление)
    console.log('\n=== DELETE ===');
    const [deleteResult] = await pool.query('DELETE FROM students WHERE id = ?', [1]);
    console.log(`✓ Удалён студент id=1: affectedRows=${deleteResult.affectedRows}`);

    // 6. SQL-инъекция
    console.log('\n=== Защита от SQL-инъекции ===');
    const maliciousInput = "'; DROP TABLE students; --";
    console.log(`Попытка инъекции: "${maliciousInput}"`);
    
    await pool.query('SELECT * FROM students WHERE name = ?', [maliciousInput]);
    console.log('✓ Параметризованный запрос безопасен');
    console.log('✖ Конкатенация привела бы к удалению таблицы');

    await pool.end();
  } catch (err) {
    console.error('✖ Ошибка при выполнении CRUD:', err.message);
  }
}

run();