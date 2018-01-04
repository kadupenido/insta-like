const express = require('express');
const router = express.Router();
const locationController = require('./location-controller');
const authController = require('../auth/auth-controller');

router.post('/getLocations', authController.authorize, locationController.getLocations);
router.post('/getUsersByLocationMedia', authController.authorize, locationController.getUsersByLocationMedia);
router.post('/getMediaByLocation', authController.authorize, locationController.getMediaByLocation);

module.exports = router;