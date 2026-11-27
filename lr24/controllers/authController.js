const AuthModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'supersecretkey_bbmo'; // В реальном проекте в .env

exports.register = async (ctx) => {
  const { name, email, password } = ctx.request.body;

  // Проверка, есть ли уже такой email
  const existing = await AuthModel.findByEmail(email);
  if (existing) {
    ctx.status = 409;
    ctx.body = { error: 'Email already exists' };
    return;
  }

  // Хэшируем пароль (10 раундов)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await AuthModel.createUser({
    name,
    email,
    password: hashedPassword,
    group_name: 'ББМО-01-23'
  });

  ctx.status = 201;
  ctx.body = { data: { userId: user._id, email: user.email } };
};

exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;

  const user = await AuthModel.findByEmail(email);
  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid credentials' };
    return;
  }

  // Сравниваем пароли
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid credentials' };
    return;
  }

  // Создаем JWT токен
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  );

  ctx.body = { accessToken: token };
}; 
