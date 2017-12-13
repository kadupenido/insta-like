const express = require('express');
const router = express.Router();
const followController = require('./follow-controller');
const authController = require('../auth/auth-controller');

router.post('/followEndLikeByLocation', authController.authorize, followController.followEndLikeByLocation);

module.exports = router;