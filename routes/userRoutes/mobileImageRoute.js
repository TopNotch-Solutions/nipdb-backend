const {Router} = require('express');
const mobileImageController = require('../../controllers/user/mobileImageController');
const mobileImageUserRouter = Router();

mobileImageUserRouter.get('/all', mobileImageController.all);
mobileImageUserRouter.get('/single/:id', mobileImageController.single);


module.exports = mobileImageUserRouter;