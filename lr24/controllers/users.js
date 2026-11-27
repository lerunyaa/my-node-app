const userService = require('../services/userService');

exports.getAll = async (ctx) => {
  // Передаем query-параметры (page, limit, sort, search и т.д.) в сервис
  const result = await userService.getAllUsers(ctx.query);
  
  ctx.body = {
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages
    }
  };
};

exports.getById = async (ctx) => {
  const user = await userService.getUserById(ctx.params.id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  ctx.body = { data: user };
};

exports.create = async (ctx) => {
  const user = await userService.createUser(ctx.request.body);
  ctx.status = 201;
  ctx.body = { data: user };
};