const {Router} = require('express');
const authController = require('../../controllers/admin/authController');
const {tokenAuthMiddleware} = require("../../middlewares/web/authMiddleware");
const {checkAdmin} = require('../../middlewares/web/authMiddleware');
const {refreshTokens} = require('../../middlewares/web/authMiddleware');
const authAdminRouter = Router();

authAdminRouter.post('/signup', authController.signup);  
authAdminRouter.post('/login', authController.login);
authAdminRouter.post('/forgot-password', authController.forgotPassword);    //provide email

authAdminRouter.get('/logout', tokenAuthMiddleware, checkAdmin, authController.logout);
authAdminRouter.get('/currentUser', tokenAuthMiddleware, checkAdmin, authController.currentUser);

authAdminRouter.put('/change-password',tokenAuthMiddleware, checkAdmin, authController.changePassword);    //provide password and confirm password and save a notification to user email to notify them that their password has been changed
authAdminRouter.put('/update/details',tokenAuthMiddleware, checkAdmin, authController.details); 
authAdminRouter.put('/update/profile-image',tokenAuthMiddleware, checkAdmin,authController.profileImage); 

authAdminRouter.delete('/delete',tokenAuthMiddleware, checkAdmin,authController.delete); 

module.exports = authAdminRouter;