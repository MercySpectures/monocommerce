const { query } = require('../config/db');

const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const couponRes = await query(
      `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = TRUE`,
      [code.trim()]
    );

    if (couponRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promotional code' });
    }

    const coupon = couponRes.rows[0];

    // Check expiration if any
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' });
    }

    const total = parseFloat(cartTotal || 0);

    // Minimum order check
    if (coupon.min_order_amount && total < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this code`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (total * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, total);

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully`,
      data: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: parseFloat(coupon.discount_value),
        discountAmount: Math.round(discountAmount * 100) / 100
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateCoupon,
};
