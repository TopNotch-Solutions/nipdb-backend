const {Router} = require('express');
const authController = require('../../controllers/user/authController');
const authUserRouter = Router();
const {tokenAuthMiddleware} = require("../../middlewares/mobile/authMiddleware");
const {checkUser} = require("../../middlewares/mobile/authMiddleware");

authUserRouter.post('/signup', authController.signup);  
authUserRouter.post('/verifyOTP',authController.verifyOTP);
authUserRouter.post('/forget-password/verifyOTP',authController.verifyForgotOTP);
authUserRouter.post('/resendOTP', authController.resendOTP);
authUserRouter.post('/login', authController.login);
authUserRouter.post('/forgot-password/email', authController.forgotPasswordEmail);    //provide email
authUserRouter.post('/forgot-password/resendOTP', authController.forgotPasswordResendOTP); 

authUserRouter.get('/logout',authController.logout)

authUserRouter.put('/change-password', tokenAuthMiddleware, checkUser, authController.changePassword);    //provide password and confirm password and save a notification to user email to notify them that their password has been changed
authUserRouter.put('/forgot-password/new-password', authController.forgotPasswordNewPassword);

module.exports = authUserRouter;