
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3004;

const FIRST_NAMES = ['Аркадий', 'Семён', 'Иван', 'Вадим', 'Максим', 'Егор', 'Дмитрий', 'Жора', 'Сергей', 'Гоша'];
const LAST_NAMES = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков'];
const GROUPS = ['401', '401', '401', '401'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStudents(count) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    result.push({
      id: i,
      name: `${randomFrom(LAST_NAMES)} ${randomFrom(FIRST_NAMES)}`,
      group: randomFrom(GROUPS),
      course: Math.floor(Math.random() * 4) + 1
    });
  }
  return result;
}

let students = generateStudents(50);
let nextId = 51;

console.log(`Сгенерировано ${students.length} студентов`);

app.use(bodyParser());

router.get('/students', (ctx) => {
  let result = [...students];

  const { search } = ctx.query;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s => s.name.toLowerCase().includes(q));
  }

  const { sort } = ctx.query;
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    result.sort((a, b) => {
      if (a[field] < b[field]) return desc ? 1 : -1;
      if (a[field] > b[field]) return desc ? -1 : 1;
      return 0;
    });
  }
  const limit = parseInt(ctx.query.limit, 10) || 10;
  const offset = parseInt(ctx.query.offset, 10) || 0;
  const total = result.length;
  const paginated = result.slice(offset, offset + limit);

  ctx.body = {
    total,
    limit,
    offset,
    count: paginated.length,
    data: paginated
  };
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
  console.log(`Примеры запросов:`);
  console.log(`  http://localhost:${PORT}/students`);
  console.log(`  http://localhost:${PORT}/students?limit=5&offset=10`);
  console.log(`  http://localhost:${PORT}/students?sort=name&limit=5`);
  console.log(`  http://localhost:${PORT}/students?search=Алек`);
  console.log(`  http://localhost:${PORT}/students?limit=10&offset=0&sort=name&search=Ан`);
});