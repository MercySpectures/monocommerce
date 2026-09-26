const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Orders
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Customizer Orders
router.get('/custom-orders', adminController.getCustomOrders);

// Products
router.get('/products', adminController.getProductsAdmin);
router.post('/products', adminController.createProductAdmin);
router.put('/products/:id', adminController.updateProductAdmin);
router.delete('/products/:id', adminController.deleteProductAdmin);

// Inventory
router.get('/inventory', adminController.getInventoryAdmin);
router.put('/inventory/:variantId', adminController.updateInventoryStock);

// Customers
router.get('/customers', adminController.getCustomersAdmin);

// Coupons
router.get('/coupons', adminController.getCouponsAdmin);
router.post('/coupons', adminController.createCouponAdmin);
router.delete('/coupons/:id', adminController.deleteCouponAdmin);

// Reviews
router.get('/reviews', adminController.getReviewsAdmin);
router.put('/reviews/:id/status', adminController.updateReviewStatusAdmin);

module.exports = router;
