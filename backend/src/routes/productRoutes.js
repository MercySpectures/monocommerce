const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:slug', productController.getProductBySlug);
router.post('/:productId/reviews', optionalAuth, productController.addReview);

module.exports = router;
