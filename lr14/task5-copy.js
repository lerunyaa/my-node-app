const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const VARIANT = 7;
const SOURCE = `source_${VARIANT}`;
const BACKUP = `backup_${VARIANT}`;
const SYNC_REPORT = `sync_report_${VARIANT}.txt`;

async function createSourceStructure() {
  console.log(`Создание тестовой структуры ${SOURCE}...`);

  await fsp.mkdir(path.join(__dirname, SOURCE), { recursive: true });
  await fsp.mkdir(path.join(__dirname, SOURCE, 'sub1'), { recursive: true });
  await fsp.mkdir(path.join(__dirname, SOURCE, 'sub2'), { recursive: true });
  await fsp.mkdir(path.join(__dirname, SOURCE, 'sub3'), { recursive: true });

  const files = [
    { name: 'file1.txt', size: 1024 },
    { name: 'file2.js', size: 2048 },
    { name: 'file3.json', size: 512 },
    { name: 'file4.jpg', size: 1024 * 1024 },
    { name: 'file5.png', size: 500 * 1024 },
    { name: 'file6.gif', size: 100 * 1024 },
    { name: 'file7.md', size: 300 },
    { name: 'file8.txt', size: 1500 },
    { name: 'file9.js', size: 3000 },
    { name: 'file10.json', size: 800 },
    { name: 'sub1/file11.txt', size: 2000 },
    { name: 'sub1/file12.js', size: 2500 },
    { name: 'sub2/file13.json', size: 1200 },
    { name: 'sub2/file14.txt', size: 1800 },
    { name: 'sub3/file15.png', size: 300 * 1024 },
    { name: 'sub3/file16.jpg', size: 600 * 1024 }
  ];

  const manifest = [];
  for (const file of files) {
    const fullPath = path.join(__dirname, SOURCE, file.name);
    const content = 'X'.repeat(file.size);
    await fsp.writeFile(fullPath, content);
    manifest.push({ file: file.name, size: file.size });
  }

  await fsp.writeFile(
    path.join(__dirname, SOURCE, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log(`Создано ${files.length + 1} файлов\n`);
}

function copyStream(src, dest) {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(src);
    const ws = fs.createWriteStream(dest);
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('finish', resolve);
    rs.pipe(ws);
  });
}

async function copyNormal(src, dest) {
  await fsp.copyFile(src, dest);
}

// MD5 для файла (потоково)
function md5Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function copyDir(srcDir, destDir, stats) {
  await fsp.mkdir(destDir, { recursive: true });
  const items = await fsp.readdir(srcDir, { withFileTypes: true });

  for (const item of items) {
    const src = path.join(srcDir, item.name);
    const dest = path.join(destDir, item.name);

    if (item.isDirectory()) {
      await copyDir(src, dest, stats);
    } else {
      const ext = path.extname(item.name).toLowerCase();
      const stat = await fsp.stat(src);

      if (['.txt', '.js', '.json'].includes(ext)) {
        await copyStream(src, dest);
        stats.streamCopy++;
        console.log(`  ${item.name} - потоковое копирование`);
      } else {
        await copyNormal(src, dest);
        stats.normalCopy++;
        console.log(`  ${item.name} - обычное копирование`);
      }

      if (stat.size > 500 * 1024) {
        const hash1 = await md5Stream(src);
        const hash2 = await md5Stream(dest);
        stats.md5Checked++;
        const match = hash1 === hash2 ? '✅' : '❌';
        console.log(`    MD5: ${match} ${item.name}`);
      }

      stats.total++;
    }
  }
}

async function listAllFiles(dir, base = '') {
  const result = [];
  let items;
  try {
    items = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const item of items) {
    const rel = path.join(base, item.name);
    if (item.isDirectory()) {
      result.push(...await listAllFiles(path.join(dir, item.name), rel));
    } else {
      result.push(rel);
    }
  }
  return result;
}

async function compareDirs(srcDir, destDir) {
  const srcFiles = await listAllFiles(srcDir);
  const destFiles = await listAllFiles(destDir);

  const added = destFiles.filter(f => !srcFiles.includes(f));
  const deleted = srcFiles.filter(f => !destFiles.includes(f));

  const modified = [];
  for (const f of srcFiles.filter(f => destFiles.includes(f))) {
    const s1 = await fsp.stat(path.join(srcDir, f));
    const s2 = await fsp.stat(path.join(destDir, f));
    if (s1.size !== s2.size) {
      modified.push(f);
    }
  }

  const same = srcFiles.filter(f =>
    destFiles.includes(f) && !modified.includes(f)
  );

  return { same, modified, added, deleted };
}

async function main() {
  const start = Date.now();
  try {
    await createSourceStructure();

    console.log(`Копирование ${SOURCE} → ${BACKUP}...`);
    const stats = { streamCopy: 0, normalCopy: 0, total: 0, md5Checked: 0 };
    await copyDir(
      path.join(__dirname, SOURCE),
      path.join(__dirname, BACKUP),
      stats
    );

    console.log('\nКопирование завершено!');
    console.log('Статистика:');
    console.log(`- Скопировано файлов: ${stats.total}`);
    console.log(`- Потоковое копирование: ${stats.streamCopy}`);
    console.log(`- Обычное копирование: ${stats.normalCopy}`);
    console.log(`- MD5-проверок: ${stats.md5Checked}`);

    console.log('\nСравнение директорий:');
    const diff = await compareDirs(
      path.join(__dirname, SOURCE),
      path.join(__dirname, BACKUP)
    );

    console.log(`- Совпадают: ${diff.same.length} файлов`);
    console.log(`- Изменены: ${diff.modified.length} файлов`);
    console.log(`- Добавлены: ${diff.added.length} файлов`);
    console.log(`- Удалены: ${diff.deleted.length} файлов`);

    const report = [
      `Сравнение ${SOURCE} и ${BACKUP}`,
      `Совпадают: ${diff.same.length}`,
      `Изменены: ${diff.modified.length}`,
      `Добавлены: ${diff.added.length}`,
      `Удалены: ${diff.deleted.length}`,
      '',
      'MD5 проверки (для файлов > 500 КБ):',
      `Всего проверок: ${stats.md5Checked}`,
      '',
      'Изменённые файлы:',
      ...diff.modified,
      '',
      'Добавленные файлы:',
      ...diff.added,
      '',
      'Удалённые файлы:',
      ...diff.deleted
    ].join('\n');

    await fsp.writeFile(path.join(__dirname, SYNC_REPORT), report, 'utf8');
    console.log(`\nОтчет сохранен: ${SYNC_REPORT}`);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`Время выполнения: ${elapsed} сек`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

main();