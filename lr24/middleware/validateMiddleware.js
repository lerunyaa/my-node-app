const Joi = require('joi');

// Валидация для создания (body)
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  group_name: Joi.string().pattern(/^ББМО-\d{2}-\d{2}$/).required(),
  age: Joi.number().integer().min(16).max(100).required()
});

// Валидация для поиска (query)
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('name', '-name', 'age', '-age', 'created_at', '-created_at').optional(),
  group_name: Joi.string().optional(),
  search: Joi.string().optional()
});

exports.validateBody = (schema) => async (ctx, next) => {
  const { error } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = {
      error: 'Validation failed',
      details: error.details.map(d => ({ field: d.path[0], message: d.message }))
    };
    return;
  }
  await next();
};

exports.validateQuery = (schema) => async (ctx, next) => {
  const { error } = schema.validate(ctx.query);
  if (error) {
    ctx.status = 400;
    ctx.body = {
      error: 'Validation failed',
      details: error.details.map(d => ({ field: d.path[0], message: d.message }))
    };
    return;
  }
  await next();
};

module.exports.userSchema = userSchema;
module.exports.querySchema = querySchema;