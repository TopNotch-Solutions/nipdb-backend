const {Router} = require('express');
const notificationController = require('../../controllers/user/notificationController');
const notificationUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

notificationUserRouter.get('/notifications', tokenAuthMiddleware, checkUser, notificationController.allUserNotfication);
notificationUserRouter.get('/totalNotificationCount', tokenAuthMiddleware, checkUser, notificationController.totalNotficationCount);

notificationUserRouter.put('/update',tokenAuthMiddleware, checkUser, notificationController.updateViewed); // make all as viewed

notificationUserRouter.delete('/delete/:id', tokenAuthMiddleware, checkUser, notificationController.deleteSingle);

module.exports = notificationUserRouter;