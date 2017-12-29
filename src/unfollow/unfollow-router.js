const express = require('express');
const router = express.Router();
const unfollowController = require('./unfollow-controller');
const authController = require('../auth/auth-controller');

router.post('/', authController.authorize, unfollowController.unfollow);

module.exports = router;