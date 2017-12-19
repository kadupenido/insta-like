const express = require('express');
const router = express.Router();
const locationController = require('./location-controller');
const authController = require('../auth/auth-controller');

router.post('/getLocations', authController.authorize, locationController.getLocations);

module.exports = router;