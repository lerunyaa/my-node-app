const studentDAO = require('../dao/studentDAO');

exports.getAll = async (ctx) => {
  const limit = parseInt(ctx.query.limit) || 10;
  const offset = parseInt(ctx.query.offset) || 0;
  ctx.body = await studentDAO.findAll(limit, offset);
};

exports.getById = async (ctx) => {
  const student = await studentDAO.findById(ctx.params.id);
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: 'Not found' };
    return;
  }
  ctx.body = student;
};

exports.create = async (ctx) => {
  const { name, group_name, course, grade } = ctx.request.body;
  const student = await studentDAO.create({ name, group_name, course, grade });
  ctx.status = 201;
  ctx.body = student;
};

exports.getStats = async (ctx) => {
  ctx.body = await studentDAO.getStats();
}; 
