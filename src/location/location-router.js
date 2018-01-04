const express = require('express');
const router = express.Router();
const locationController = require('./location-controller');
const authController = require('../auth/auth-controller');

router.post('/getLocationsByName', authController.authorize, locationController.getLocationsByName);
router.post('/getUsersByLocation', authController.authorize, locationController.getUsersByLocation);
router.post('/getMediaByLocation', authController.authorize, locationController.getMediaByLocation);

module.exports = router;