const {Router} = require('express');
const secondaryIndustryUserController = require('../../controllers/user/secondaryIndustryController');
const secondaryIndustryUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");


secondaryIndustryUserRouter.get('/all', tokenAuthMiddleware, checkUser, secondaryIndustryUserController.all);
secondaryIndustryUserRouter.get('/single/:id', tokenAuthMiddleware, checkUser, secondaryIndustryUserController.single);


module.exports = secondaryIndustryUserRouter;