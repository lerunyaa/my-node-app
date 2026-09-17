
const fs = require('fs').promises;
const path = require('path');

const VARIANT = 7; 
const PROJECT = `project_${VARIANT}`;

async function printTree(dir, prefix = '') {
  const items = await fs.readdir(dir);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isLast = i === items.length - 1;
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}`);
    if (stat.isDirectory()) {
      await printTree(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  }
}

async function main() {
  try {
    const dirs = [
      `${PROJECT}/src/modules`,
      `${PROJECT}/src/components`,
      `${PROJECT}/src/utils`,
      `${PROJECT}/data/input`,
      `${PROJECT}/data/output`,
      `${PROJECT}/temp`
    ];

    for (const d of dirs) {
      await fs.mkdir(path.join(__dirname, d), { recursive: true });
    }

    for (const n of [1, 2, 3]) {
      await fs.mkdir(
        path.join(__dirname, `${PROJECT}/src/components/${n}`),
        { recursive: true }
      );
    }

    const infoMap = {
      [`${PROJECT}`]: 'Корневая папка проекта',
      [`${PROJECT}/src`]: 'Исходный код',
      [`${PROJECT}/src/modules`]: 'Модули',
      [`${PROJECT}/src/components`]: 'Компоненты',
      [`${PROJECT}/src/components/1`]: 'Компонент 1',
      [`${PROJECT}/src/components/2`]: 'Компонент 2',
      [`${PROJECT}/src/components/3`]: 'Компонент 3',
      [`${PROJECT}/src/utils`]: 'Утилиты',
      [`${PROJECT}/data`]: 'Данные',
      [`${PROJECT}/data/input`]: 'Входные данные',
      [`${PROJECT}/data/output`]: 'Выходные данные',
      [`${PROJECT}/temp`]: 'Временные файлы'
    };

    for (const [dir, desc] of Object.entries(infoMap)) {
      await fs.writeFile(
        path.join(__dirname, dir, 'info.txt'),
        desc,
        'utf8'
      );
    }

    console.log(`Структура ${PROJECT}:`);
    await printTree(path.join(__dirname, PROJECT));

    await fs.rename(
      path.join(__dirname, `${PROJECT}/temp`),
      path.join(__dirname, `${PROJECT}/data/temp`)
    );
    console.log('\nПапка temp перемещена в data');

    await fs.rename(
      path.join(__dirname, `${PROJECT}/data/output`),
      path.join(__dirname, `${PROJECT}/data/results`)
    );
    console.log('Папка data/output переименована в data/results');

    await fs.rm(path.join(__dirname, `${PROJECT}/data/temp`), {
      recursive: true,
      force: true
    });
    console.log('Папка temp удалена');

    console.log(`\nОбновлённая структура ${PROJECT}:`);
    await printTree(path.join(__dirname, PROJECT));
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

main();