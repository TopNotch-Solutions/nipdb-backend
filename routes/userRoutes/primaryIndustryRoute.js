const {Router} = require('express');
const primaryIndustryUserController = require('../../controllers/user/primaryIndustryController');
const primaryIndustryUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");


primaryIndustryUserRouter.get('/all/details',  primaryIndustryUserController.all);
primaryIndustryUserRouter.get('/all/industryName',  primaryIndustryUserController.allIndustryName);
primaryIndustryUserRouter.get('/single/:id',tokenAuthMiddleware, checkUser, primaryIndustryUserController.single);


module.exports = primaryIndustryUserRouter;