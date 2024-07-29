const {Router} = require('express');
const bsoController = require('../../controllers/admin/bsoController');
const {tokenAuthMiddleware} = require("../../middlewares/web/authMiddleware");
const {checkAdmin} = require('../../middlewares/web/authMiddleware');
const bsoAdminRouter = Router();

bsoAdminRouter.post('/create', tokenAuthMiddleware, checkAdmin, bsoController.create);

bsoAdminRouter.get('/all', tokenAuthMiddleware, checkAdmin, bsoController.all);
bsoAdminRouter.get('/single/:id', tokenAuthMiddleware, checkAdmin, bsoController.single);
bsoAdminRouter.get('/count', tokenAuthMiddleware, checkAdmin, bsoController.totalBsos);

bsoAdminRouter.put('/update/:id',tokenAuthMiddleware, checkAdmin, bsoController.update);
bsoAdminRouter.put('/updateImage/:id',tokenAuthMiddleware, checkAdmin, bsoController.updateImage);

bsoAdminRouter.delete('/delete/:id',tokenAuthMiddleware, checkAdmin, bsoController.delete);

module.exports = bsoAdminRouter;