const Router = require('@koa/router');
const studentController = require('../controllers/studentController');

const router = new Router({ prefix: '/api/students' });

router.get('/', studentController.getAll);
router.get('/stats', studentController.getStats);
router.get('/:id', studentController.getById);
router.post('/', studentController.create);

module.exports = router; 
