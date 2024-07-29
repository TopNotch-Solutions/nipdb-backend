const {Router} = require('express');
const townController = require('../../controllers/user/townController');
const townUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

townUserRouter.get('/all', tokenAuthMiddleware, checkUser, townController.all);
townUserRouter.get('/single/:id', tokenAuthMiddleware, checkUser, townController.single);

module.exports = townUserRouter;