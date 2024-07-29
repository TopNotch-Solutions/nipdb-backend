const {Router} = require('express');
const notificationController = require('../../controllers/admin/notificationController');
const {tokenAuthMiddleware} = require("../../middlewares/web/authMiddleware");
const {checkAdmin} = require('../../middlewares/web/authMiddleware');
const notificationAdminRouter = Router();

notificationAdminRouter.post('/create/all', tokenAuthMiddleware, checkAdmin, notificationController.createAll);
notificationAdminRouter.post('/create/single',tokenAuthMiddleware, checkAdmin, notificationController.createSingle);

notificationAdminRouter.get('/all/notificationSend', tokenAuthMiddleware, checkAdmin, notificationController.allAdminNotfication); // Notification history table
notificationAdminRouter.get('/all/:userId', tokenAuthMiddleware, checkAdmin, notificationController.singleAdminNotfication);
notificationAdminRouter.get('/totalNotificationCount/:userId', tokenAuthMiddleware, checkAdmin, notificationController.totalCount);

notificationAdminRouter.put('/update/:userId/:id', tokenAuthMiddleware, checkAdmin, notificationController.updateViewed);
notificationAdminRouter.delete('/delete/:userId/:id', tokenAuthMiddleware, checkAdmin, notificationController.deleteSingle);

// notificationAdminRouter.put('/updatebulk/:senderId/:id', notificationController.updatebulk);
// notificationAdminRouter.put('/update/:senderId/:userId/:id', notificationController.updateSingle);

// notificationAdminRouter.delete('/updatebulk/:senderId/:id', notificationController.deletebulk);
// notificationAdminRouter.delete('/update/:senderId/:userId/:id', notificationController.deleteSingle);

module.exports = notificationAdminRouter;