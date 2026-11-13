const http = require('http');

const PORT = 3000;
const GROUP = '401'; // ← Ваша группа

let students = [
  { id: 1, name: 'Иван', group: GROUP },
  { id: 2, name: 'Мария', group: GROUP }
];
let nextId = 3;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const log = (status) => console.log(`[${time}] [${GROUP}] ${method} ${path} ${status}`);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (method === 'GET' && path === '/api/students') {
    let result = students;
    const groupFilter = parsedUrl.searchParams.get('group');
    
    if (groupFilter) {
      result = students.filter(s => s.group === groupFilter);
    }
    
    res.writeHead(200);
    res.end(JSON.stringify(result, null, 2));
    log(200);
  }
  
    else if (method === 'GET' && path.match(/^\/api\/students\/\d+$/)) {
    const id = parseInt(path.split('/')[3], 10);
    const student = students.find(s => s.id === id);
    
    if (student) {
      res.writeHead(200);
      res.end(JSON.stringify(student, null, 2));
      log(200);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Студент не найден' }));
      log(404);
    }
  }

   else if (method === 'POST' && path === '/api/students') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newStudent = { 
          id: nextId++, 
          name: data.name, 
          group: data.group || GROUP 
        };
        students.push(newStudent);
        res.writeHead(201); // Created
        res.end(JSON.stringify(newStudent, null, 2));
        log(201);
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Неверный JSON' }));
        log(400);
      }
    });
  }

   else if (method === 'PUT' && path.match(/^\/api\/students\/\d+$/)) {
    const id = parseInt(path.split('/')[3], 10);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const student = students.find(s => s.id === id);
      if (!student) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Студент не найден' }));
        log(404);
        return;
      }
      try {
        const data = JSON.parse(body);
        if (data.name) student.name = data.name;
        if (data.group) student.group = data.group;
        res.writeHead(200);
        res.end(JSON.stringify(student, null, 2));
        log(200);
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Неверный JSON' }));
        log(400);
      }
    });
  }

   else if (method === 'DELETE' && path.match(/^\/api\/students\/\d+$/)) {
    const id = parseInt(path.split('/')[3], 10);
    const index = students.findIndex(s => s.id === id);
    
    if (index !== -1) {
      students.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify({ deleted: true, id }, null, 2));
      log(200);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Студент не найден' }));
      log(404);
    }
  }

   else if (path.startsWith('/api/students')) {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    log(405);
  }

   else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
    log(404);
  }
});

server.listen(PORT, () => {
  console.log(`REST API запущен на порту ${PORT}`);
});