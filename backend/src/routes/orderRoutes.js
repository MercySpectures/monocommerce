const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

router.post('/razorpay-order', optionalAuth, orderController.createRazorpayOrder);
router.post('/verify', optionalAuth, orderController.verifyAndCreateOrder);
router.get('/my-orders', requireAuth, orderController.getUserOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);

module.exports = router;
