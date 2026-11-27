const Router = require('@koa/router');
const controller = require('../controllers/users');
const { validateBody, userSchema, validateQuery, querySchema } = require('../middleware/validateMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = new Router({ prefix: '/api/users' });

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     responses:
 *       200:
 *         description: Успех
 */
router.get('/', validateQuery(querySchema), controller.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить одного пользователя
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успех
 *       404:
 *         description: Не найден
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               group_name:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Создан
 */
router.post('/', validateBody(userSchema), controller.create);

// Защищенный маршрут (только для авторизованных)
router.delete('/:id', requireAuth, async (ctx) => {
  ctx.body = { message: 'User deleted (auth passed)' };
});

module.exports = router;