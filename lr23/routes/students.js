const Router = require('@koa/router');
const controller = require('../controllers/studentController');

const router = new Router({ prefix: '/api/students' });

router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router; 
