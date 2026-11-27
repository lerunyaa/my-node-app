const jwt = require('jsonwebtoken');

const SECRET = 'supersecretkey_bbmo';

exports.requireAuth = async (ctx, next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: No token provided' };
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    ctx.state.user = decoded; // Сохраняем пользователя в контекст
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Invalid token' };
  }
};

exports.requireRole = (role) => async (ctx, next) => {
  if (ctx.state.user.role !== role) {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden: insufficient rights' };
    return;
  }
  await next();
}; 
