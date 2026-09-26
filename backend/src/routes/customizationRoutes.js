const express = require('express');
const router = express.Router();
const customizationController = require('../controllers/customizationController');
const upload = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

router.post('/upload', optionalAuth, upload.single('image'), customizationController.uploadDesignAsset);
router.post('/', optionalAuth, customizationController.createCustomization);
router.get('/:id', customizationController.getCustomization);

module.exports = router;
