const {Router} = require('express');
const msmeUserController = require('../../controllers/user/msmeController');
const msmeUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

msmeUserRouter.post('/create',  msmeUserController.create);
msmeUserRouter.post('/like/:businessId', tokenAuthMiddleware, checkUser,  msmeUserController.like);
msmeUserRouter.post('/unlike/:businessId',tokenAuthMiddleware, checkUser,  msmeUserController.unlike);

msmeUserRouter.get('/all/business', msmeUserController.all);
msmeUserRouter.get('/filter/industry',msmeUserController.filterByIndustry);
msmeUserRouter.get('/recent/business',msmeUserController.recentlyAdded);

msmeUserRouter.get('/all/region/business/:region', msmeUserController.allRegionBusiness);
msmeUserRouter.get('/all/town/business', msmeUserController.allTownBusiness);
msmeUserRouter.get('/all/liked', tokenAuthMiddleware, checkUser, msmeUserController.allLiked);
msmeUserRouter.get('/single/:businessId',  msmeUserController.single);
msmeUserRouter.get('/allUserBusiness', tokenAuthMiddleware, checkUser, msmeUserController.allSingleUserMsme);

msmeUserRouter.put('/update/:businessId', tokenAuthMiddleware, checkUser,  msmeUserController.update);
msmeUserRouter.put('/updateLogo/:businessId', tokenAuthMiddleware, checkUser,  msmeUserController.updateLogo);
msmeUserRouter.put('/updateImage1/:businessId',tokenAuthMiddleware, checkUser,  msmeUserController.updateImage1);
msmeUserRouter.put('/updateImage2/:businessId',tokenAuthMiddleware, checkUser,  msmeUserController.updateImage2);
msmeUserRouter.put('/updateImage3/:businessId',tokenAuthMiddleware, checkUser,  msmeUserController.updateImage3);
msmeUserRouter.put('/updateBusinessHours/:businessId', tokenAuthMiddleware, checkUser,  msmeUserController.businessHours);

msmeUserRouter.delete('/delete/:businessId', tokenAuthMiddleware, checkUser,  msmeUserController.delete);

msmeUserRouter.patch('/visibility',tokenAuthMiddleware, checkUser,  msmeUserController.visibility);

module.exports = msmeUserRouter;