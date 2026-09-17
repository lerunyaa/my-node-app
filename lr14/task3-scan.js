const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7;
const REPORT_FILE = `report_${VARIANT}.json`;

const IGNORED_DIRS = ['node_modules', '.git'];

async function scanDir(dir, stats) {
  let items;
  try {
    items = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (IGNORED_DIRS.includes(item.name)) continue;

      stats.folders++;
      await scanDir(fullPath, stats);
    } else if (item.isFile()) {
      const s = await fs.stat(fullPath);
      const ext = path.extname(item.name) || '(без расширения)';

      stats.files++;
      stats.totalSize += s.size;

      if (!stats.extensions[ext]) {
        stats.extensions[ext] = { count: 0, size: 0 };
      }
      stats.extensions[ext].count++;
      stats.extensions[ext].size += s.size;

      stats.fileList.push({
        name: item.name,
        path: fullPath.replace(__dirname, '.'),
        size: s.size
      });
    }
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} байт`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

async function main() {
  try {
    const targetDir = process.argv[2]
      ? path.resolve(process.argv[2])
      : __dirname;

    console.log(`Анализ директории: ${targetDir}\n`);

    const stats = {
      folders: 0,
      files: 0,
      totalSize: 0,
      extensions: {},
      fileList: []
    };

    await scanDir(targetDir, stats);

    console.log(`Общее количество папок: ${stats.folders}`);
    console.log(`Общее количество файлов: ${stats.files}`);
    console.log(`Общий размер: ${formatSize(stats.totalSize)} (${stats.totalSize} байт)\n`);

    console.log('Расширения файлов:');
    for (const [ext, data] of Object.entries(stats.extensions)) {
      console.log(`  ${ext}: ${data.count} файлов (${formatSize(data.size)})`);
    }

    const sorted = [...stats.fileList].sort((a, b) => b.size - a.size);
    console.log('\nТоп-5 самых больших файлов:');
    sorted.slice(0, 5).forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
    });

    console.log('\nТоп-5 самых маленьких файлов:');
    sorted.slice(-5).reverse().forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name} (${formatSize(f.size)}) - ${f.path}`);
    });

    const report = {
      variant: VARIANT,
      analyzedDir: targetDir,
      foldersCount: stats.folders,
      filesCount: stats.files,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatSize(stats.totalSize),
      extensions: stats.extensions,
      top5Largest: sorted.slice(0, 5),
      top5Smallest: sorted.slice(-5).reverse()
    };

    const reportPath = path.join(__dirname, REPORT_FILE);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\nОтчет сохранен: ${REPORT_FILE}`);
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

main();