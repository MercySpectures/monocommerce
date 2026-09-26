const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, wishlistController.getWishlist);
router.post('/toggle', requireAuth, wishlistController.toggleWishlist);

module.exports = router;
