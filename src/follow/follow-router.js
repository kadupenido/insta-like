const express = require('express');
const router = express.Router();
const followController = require('./follow-controller');
const authController = require('../auth/auth-controller');

router.post('/followEndLike', authController.authorize, followController.followEndLike);
router.post('/fixFollowBugs', authController.authorize, followController.fixFollowBugs);

module.exports = router;