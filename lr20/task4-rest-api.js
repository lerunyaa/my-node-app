const http = require('http');
const PORT = 3003;
const GROUP = '401';

let students = [
  { id: 1, name: 'Иван', group: GROUP },
  { id: 2, name: 'Мария', group: GROUP }
];
let nextId = 3;

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const path = urlParts[0];
  const query = urlParts[1] || '';
  
  console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [${GROUP}] ${req.method} ${req.url}`);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Group', GROUP);

  if (req.method === 'GET' && path === '/api/students') {
    let result = students;
    if (query.includes('group=')) {
      const groupParam = decodeURIComponent(query.split('group=')[1].split('&')[0]);
      result = students.filter(s => s.group === groupParam);
    }
    res.writeHead(200);
    res.end(JSON.stringify(result, null, 2));
  }
  
  else if (req.method === 'GET' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    const student = students.find(s => s.id === id);
    if (student) {
      res.writeHead(200);
      res.end(JSON.stringify(student, null, 2));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Student not found' }));
    }
  }

  else if (req.method === 'POST' && path === '/api/students') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const newStudent = JSON.parse(body);
        newStudent.id = nextId++;
        newStudent.group = GROUP;
        students.push(newStudent);
        res.writeHead(201); // Created
        res.end(JSON.stringify(newStudent, null, 2));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  else if (req.method === 'PUT' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const student = students.find(s => s.id === id);
      if (!student) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      try {
        const updatedData = JSON.parse(body);
        student.name = updatedData.name || student.name;
        student.group = updatedData.group || student.group;
        res.writeHead(200);
        res.end(JSON.stringify(student, null, 2));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  else if (req.method === 'DELETE' && path.startsWith('/api/students/')) {
    const id = parseInt(path.split('/')[3]);
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students.splice(index, 1);
      res.writeHead(200);
      res.end(JSON.stringify({ deleted: true, id: id }, null, 2));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  else if (path.startsWith('/api/students')) {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: '404 Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});