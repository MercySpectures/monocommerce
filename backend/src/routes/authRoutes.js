const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, authController.updateProfile);
router.get('/addresses', requireAuth, authController.getAddresses);
router.post('/addresses', requireAuth, authController.saveAddress);

module.exports = router;
