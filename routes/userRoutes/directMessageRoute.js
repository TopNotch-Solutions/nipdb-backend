const {Router} = require('express');
const directMessageController = require('../../controllers/user/directMessageController');
const directMessageUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

directMessageUserRouter.post('/create/message', tokenAuthMiddleware, checkUser, directMessageController.create);

directMessageUserRouter.get('/all/messages', tokenAuthMiddleware, checkUser, directMessageController.all);
directMessageUserRouter.get('/single/chat', tokenAuthMiddleware, checkUser, directMessageController.single);
directMessageUserRouter.get('/incoming/messages/count',tokenAuthMiddleware, checkUser, directMessageController.count)

directMessageUserRouter.put('/update',tokenAuthMiddleware, checkUser, directMessageController.update);
directMessageUserRouter.put('/update/status',tokenAuthMiddleware, checkUser, directMessageController.viewed);

directMessageUserRouter.delete('/delete/message',tokenAuthMiddleware, checkUser, directMessageController.delete);


module.exports = directMessageUserRouter;