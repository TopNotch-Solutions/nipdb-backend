const {Router} = require('express');
const mobileImageController = require('../../controllers/admin/mobileImageController');
const {tokenAuthMiddleware} = require("../../middlewares/web/authMiddleware");
const {checkAdmin} = require('../../middlewares/web/authMiddleware');
const mobileImageAdminRouter = Router();

mobileImageAdminRouter.post('/create', tokenAuthMiddleware, checkAdmin, mobileImageController.create); 

mobileImageAdminRouter.get('/all', tokenAuthMiddleware, checkAdmin, mobileImageController.all);
mobileImageAdminRouter.get('/single/:id', tokenAuthMiddleware, checkAdmin, mobileImageController.single);

mobileImageAdminRouter.put('/update/:id', tokenAuthMiddleware, checkAdmin, mobileImageController.update);
mobileImageAdminRouter.delete('/delete/:id',tokenAuthMiddleware, checkAdmin, mobileImageController.delete);


module.exports = mobileImageAdminRouter;