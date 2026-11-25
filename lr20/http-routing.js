const http = require('http');

const PORT = 3000;
const GROUP = '401';

// Наша "база данных" в памяти
let students = [
  { id: 1, name: 'Иван', group: GROUP },
  { id: 2, name: 'Мария', group: GROUP }
];

let nextId = 3;

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const path = urlParts[0];
  const query = new URLSearchParams(urlParts[1] || '');

  // Логирование
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Устанавливаем заголовки для JSON по умолчанию
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // === МАРШРУТИЗАЦИЯ ===

  // 1. GET /api/students (все студенты или с фильтром ?group=...)
  if (req.method === 'GET' && path === '/api/students') {
    const groupFilter = query.get('group');
    let result = students;
    if (groupFilter) {
      result = students.filter(s => s.group === groupFilter);
    }
    res.writeHead(200);
    res.end(JSON.stringify(result, null, 2));
    console.log(`[${time}] GET /api/students 200`);

  // 2. GET /api/students/:id (один студент)
  } else if (req.method === 'GET' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    const student = students.find(s => s.id === id);
    if (student) {
      res.writeHead(200);
      res.end(JSON.stringify(student, null, 2));
      console.log(`[${time}] GET ${path} 200`);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Student not found' }));
      console.log(`[${time}] GET ${path} 404`);
    }

  // 3. POST /api/students (создание)
  } else if (req.method === 'POST' && path === '/api/students') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newStudent = { id: nextId++, name: data.name, group: data.group || GROUP };
        students.push(newStudent);
        res.writeHead(201);
        res.end(JSON.stringify(newStudent, null, 2));
        console.log(`[${time}] POST /api/students 201`);
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  // 4. PUT /api/students/:id (обновление)
  } else if (req.method === 'PUT' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const student = students.find(s => s.id === id);
      if (!student) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Student not found' }));
      }
      try {
        const data = JSON.parse(body);
        if (data.name) student.name = data.name;
        res.writeHead(200);
        res.end(JSON.stringify(student, null, 2));
        console.log(`[${time}] PUT ${path} 200`);
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  // 5. DELETE /api/students/:id (удаление)
  } else if (req.method === 'DELETE' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify({ deleted: true, id }, null, 2));
      console.log(`[${time}] DELETE ${path} 200`);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Student not found' }));
    }

  // 6. 405 Method Not Allowed
  } else if (path.startsWith('/api/students')) {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    console.log(`[${time}] ${req.method} ${path} 405`);

  // 7. 404 Not Found
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
    console.log(`[${time}] ${req.method} ${path} 404`);
  }
});

server.listen(PORT, () => {
  console.log(`REST API Сервер запущен на порту ${PORT}`);
}); 
