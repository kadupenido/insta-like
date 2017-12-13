const express = require('express');
const router = express.Router();
const userController = require('./user-controller');
const authController = require('../auth/auth-controller');

router.get('/me', authController.authorize, userController.getMyInfo);

module.exports = router;