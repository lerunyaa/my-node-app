 
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'student',
    password: process.env.DB_PASSWORD || 'student',
    database: process.env.DB_NAME || 'bbmo_01_23',
  };

  console.log('=== Одиночное соединение ===');
  try {
    const connection = await mysql.createConnection(config);
    console.log('✔ Подключение установлено');

    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as db, USER() as user');
    console.log(`Версия MySQL: ${rows[0].version}`);
    console.log(`Текущая БД: ${rows[0].db}`);
    console.log(`Пользователь: ${rows[0].user}`);

    await connection.end();
    console.log('✔ Соединение закрыто');
  } catch (err) {
    console.error('✖ Ошибка подключения:', err.code);
  }

  console.log('\n=== Пул соединений ===');
  try {
    const pool = mysql.createPool({ ...config, connectionLimit: 10 });
    console.log('✔ Пул создан (лимит: 10)');

    const [rows] = await pool.query('SELECT VERSION() as version, DATABASE() as db');
    console.log(`Версия MySQL: ${rows[0].version}`);
    console.log(`Текущая БД: ${rows[0].db}`);
    console.log('✔ Пул готов к работе');
    
    await pool.end();
  } catch (err) {
    console.error('✖ Ошибка пула:', err.code);
  }
}

run();