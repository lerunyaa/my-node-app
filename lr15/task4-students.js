const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3003;

let students = [
  { id: 1, name: 'Валерия', group: '401', course: 2 },
  { id: 2, name: 'Дарья', group: '401', course: 1 },
  { id: 3, name: 'Максим', group: '401', course: 3 }
];
let nextId = 4;

app.use(bodyParser());

router.get('/students', (ctx) => {
  const { group } = ctx.query;
  let result = students;
  if (group) {
    result = students.filter(s => s.group === group);
  }
  ctx.body = result;
});

router.get('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const student = students.find(s => s.id === id);
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: `Студент с id=${id} не найден` };
    return;
  }
  ctx.body = student;
});

router.post('/students', (ctx) => {
  const { name, group, course } = ctx.request.body;

  if (!name || !group || !course) {
    ctx.status = 400;
    ctx.body = { error: 'Поля name, group, course обязательны' };
    return;
  }
  if (typeof course !== 'number' || course < 1 || course > 4) {
    ctx.status = 400;
    ctx.body = { error: 'Поле course должно быть числом от 1 до 4' };
    return;
  }

  const student = { id: nextId++, name, group, course };
  students.push(student);
  ctx.status = 201;
  ctx.body = student;
});

router.put('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const student = students.find(s => s.id === id);
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: `Студент с id=${id} не найден` };
    return;
  }
  const { name, group, course } = ctx.request.body;
  if (name) student.name = name;
  if (group) student.group = group;
  if (course) student.course = course;
  ctx.body = student;
});

router.delete('/students/:id', (ctx) => {
  const id = parseInt(ctx.params.id, 10);
  const index = students.findIndex(s => s.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: `Студент с id=${id} не найден` };
    return;
  }
  const deleted = students.splice(index, 1)[0];
  ctx.body = { message: 'Студент удалён', student: deleted };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Примеры:`);
  console.log(`  http://localhost:${PORT}/students`);
  console.log(`  http://localhost:${PORT}/students?group=ББМО-01-23`);
  console.log(`  http://localhost:${PORT}/students/1`);
});