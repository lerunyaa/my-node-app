const pool = require('../models/db');

// GET /api/students — список с пагинацией
exports.getAll = async (ctx) => {
  const limit = parseInt(ctx.query.limit) || 10;
  const offset = parseInt(ctx.query.offset) || 0;

  const [rows] = await pool.query('SELECT * FROM students LIMIT ? OFFSET ?', [limit, offset]);
  const [count] = await pool.query('SELECT COUNT(*) as total FROM students');
  const total = count[0].total;

  ctx.body = {
    data: rows,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    }
  };
};

// GET /api/students/:id — один студент
exports.getById = async (ctx) => {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [ctx.params.id]);
  if (rows.length === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Student not found' };
    return;
  }
  ctx.body = rows[0];
};

// POST /api/students — создание
exports.create = async (ctx) => {
  const { name, group_name, course, grade } = ctx.request.body;
  const [result] = await pool.query(
    'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
    [name, group_name, course, grade]
  );
  ctx.status = 201;
  ctx.body = { id: result.insertId, name, group_name, course, grade };
};

// GET /api/students/stats — статистика
exports.getStats = async (ctx) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as total, AVG(grade) as averageGrade FROM students
  `);
  const [groups] = await pool.query(`
    SELECT group_name, COUNT(*) as count FROM students GROUP BY group_name
  `);
  
  ctx.body = {
    total: rows[0].total,
    averageGrade: rows[0].averageGrade ? parseFloat(rows[0].averageGrade).toFixed(2) : 0,
    byGroup: groups.reduce((acc, g) => ({ ...acc, [g.group_name]: g.count }), {})
  };
}; 
