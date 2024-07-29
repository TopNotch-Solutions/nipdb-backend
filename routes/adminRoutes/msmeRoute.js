const {Router} = require('express');
const msmeAdminController = require('../../controllers/admin/msmeController');
const {tokenAuthMiddleware} = require("../../middlewares/web/authMiddleware");
const {checkAdmin} = require('../../middlewares/web/authMiddleware');
const msmeAdminRouter = Router();
msmeAdminRouter.post('/create', tokenAuthMiddleware, checkAdmin, msmeAdminController.create);
msmeAdminRouter.get('/all/user', tokenAuthMiddleware, checkAdmin, msmeAdminController.allUser)
msmeAdminRouter.get('/all', tokenAuthMiddleware, checkAdmin, msmeAdminController.all);
msmeAdminRouter.get('/single/:id', tokenAuthMiddleware, checkAdmin, msmeAdminController.single);
msmeAdminRouter.get('/totalCount',  msmeAdminController.totalCount);
msmeAdminRouter.get('/pendingCount', tokenAuthMiddleware, checkAdmin, msmeAdminController.pendingCount);
msmeAdminRouter.get('/rejectedCount',tokenAuthMiddleware, checkAdmin, msmeAdminController.rejectedCount);
msmeAdminRouter.get('/approvedCount', tokenAuthMiddleware, checkAdmin, msmeAdminController.approvedCount);
//msmeAdminRouter.get('/top5/categories', tokenAuthMiddleware, checkAdmin, msmeAdminController.topCategory);

msmeAdminRouter.patch('/status/:userId/:id', tokenAuthMiddleware, checkAdmin, msmeAdminController.status); // provide status Approved, Rejected
msmeAdminRouter.patch('/block/:userId/:id', tokenAuthMiddleware, checkAdmin, msmeAdminController.block); //provide true or false

module.exports = msmeAdminRouter;