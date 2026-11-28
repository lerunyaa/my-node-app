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

  console.log('=== Демонстрация ошибок ===');
  
  // 1. Сетевая ошибка (неверный порт)
  try {
    await mysql.createConnection({ ...config, port: 9999 });
  } catch (e) {
    console.log(`[${e.code}] Сервер недоступен: localhost:9999`);
  }

  // 2. Ошибка аутентификации (неверный пароль)
  try {
    await mysql.createConnection({ ...config, password: 'wrong_password' });
  } catch (e) {
    console.log(`[${e.code}] Неверный пароль для пользователя student`);
  }

  // 3. Синтаксическая ошибка
  try {
    const pool = mysql.createPool(config);
    await pool.query('SELECT * FRM students');
  } catch (e) {
    console.log(`[${e.code}] Синтаксическая ошибка: SELECT * FRM students`);
  }

  // 4. Дубликат ключа (гарантированно создаем id=1, потом пробуем дубликат)
  try {
    const pool = mysql.createPool(config);
    // Сначала принудительно очищаем и вставляем запись с id=1
    await pool.query('DELETE FROM students WHERE id = 1');
    await pool.query('INSERT INTO students (id, name, group_name, course) VALUES (1, "Иван", "ББМО-01-23", 1)');
    
    // А теперь пробуем вставить дубликат
    await pool.query('INSERT INTO students (id, name, group_name, course) VALUES (1, "Тест", "ББМО-01-23", 1)');
  } catch (e) {
    console.log(`[${e.code}] Дублирование ключа: id=1`);
  }

  // 5. NULL в NOT NULL
  try {
    const pool = mysql.createPool(config);
    await pool.query('INSERT INTO students (name, group_name, course) VALUES (NULL, "ББМО-01-23", 1)');
  } catch (e) {
    console.log(`[${e.code}] NULL в NOT NULL столбце: name`);
  }

  // --- Транзакция ---
  console.log('\n=== Транзакция ===');
  const pool = mysql.createPool(config);
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    console.log('Начало транзакции');
    
    await conn.query('INSERT INTO students (name, group_name, course) VALUES (?, ?, ?)', ['Студент 1', GROUP, 1]);
    console.log('✓ INSERT 1 выполнен');
    
    await conn.query('INSERT INTO students (name, group_name, course) VALUES (?, ?, ?)', ['Студент 2', GROUP, 1]);
    console.log('✓ INSERT 2 выполнен');
    
    // Специально вызываем ошибку (дубликат id=1)
    await conn.query('INSERT INTO students (id, name, group_name, course) VALUES (1, "Дубликат", ?, 1)', [GROUP]);
    console.log('✓ INSERT 3 выполнен'); // Эта строка не выполнится
    
    await conn.commit();
    console.log('Транзакция зафиксирована (commit)');
  } catch (e) {
    await conn.rollback();
    console.log(`✗ INSERT 3 не выполнен (${e.code})`);
    console.log('Rollback выполнен (изменения отменены)');
  } finally {
    conn.release();
    console.log('Соединение возвращено в пул');
  }

  await pool.end();
}

run();