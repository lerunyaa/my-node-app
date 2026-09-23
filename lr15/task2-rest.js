const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3001;

let users = [
  { id: 1, name: 'Какулина Валерия', group: '401' },
  { id: 2, name: 'Поддубская Дарья', group: '401' }
];
let nextId = 3;

app.use(bodyParser());

router.get('/api/users', (ctx) => {
  ctx.body = users;
});

router.post('/api/users', (ctx) => {
  const { name, group } = ctx.request.body;

  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: 'Поля name и group обязательны' };
    return;
  }

  const user = { id: nextId++, name, group };
  users.push(user);
  ctx.status = 201;
  ctx.body = user;
});

router.put('/api/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: `Пользователь с id=${id} не найден` };
    return;
  }

  const { name, group } = ctx.request.body;

  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: 'Поля name и group обязательны' };
    return;
  }

  user.name = name;
  user.group = group;
  ctx.body = user;
});


router.delete('/api/users/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: `Пользователь с id=${id} не найден` };
    return;
  }

  const deleted = users.splice(index, 1)[0];
  ctx.body = { message: 'Пользователь удалён', user: deleted };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`REST API запущен: http://localhost:${PORT}`);
  console.log(`Примеры запросов:`);
  console.log(`  GET    http://localhost:${PORT}/api/users`);
  console.log(`  POST   http://localhost:${PORT}/api/users`);
  console.log(`  PUT    http://localhost:${PORT}/api/users/1`);
  console.log(`  DELETE http://localhost:${PORT}/api/users/1`);
});