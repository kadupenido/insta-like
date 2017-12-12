const express = require('express');
const router = express.Router();
const userController = require('./user-controller');
const authService = require('../auth/auth-service');

router.get('/me', authService.authorize, userController.getMyInfo);

module.exports = router;