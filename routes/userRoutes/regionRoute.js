const {Router} = require('express');
const regionController = require('../../controllers/user/regionController');
const regionUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

regionUserRouter.get('/all', tokenAuthMiddleware, checkUser, regionController.all);
regionUserRouter.get('/single/:id', tokenAuthMiddleware, checkUser, regionController.single);

module.exports = regionUserRouter;