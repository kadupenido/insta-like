const express = require('express');
const router = express.Router();
const authController = require('./auth-controller');

router.post('/authenticate', authController.authenticate);

module.exports = router;