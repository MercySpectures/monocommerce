const { query } = require('../config/db');

// Helper to get or create cart
async function getOrCreateCart(userId, sessionId) {
  let cartRes;
  if (userId) {
    cartRes = await query(`SELECT * FROM carts WHERE user_id = $1 LIMIT 1`, [userId]);
    if (cartRes.rows.length === 0) {
      cartRes = await query(
        `INSERT INTO carts (user_id, session_id) VALUES ($1, $2) RETURNING *`,
        [userId, sessionId || null]
      );
    }
  } else {
    cartRes = await query(`SELECT * FROM carts WHERE session_id = $1 LIMIT 1`, [sessionId]);
    if (cartRes.rows.length === 0) {
      cartRes = await query(
        `INSERT INTO carts (session_id) VALUES ($1) RETURNING *`,
        [sessionId]
      );
    }
  }
  return cartRes.rows[0];
}

const getCart = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'default-guest-session';
    const userId = req.user ? req.user.id : null;

    const cart = await getOrCreateCart(userId, sessionId);

    const itemsRes = await query(
      `SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.variant_id,
        ci.size,
        ci.color,
        ci.quantity,
        ci.price_at_time,
        ci.customization_id,
        p.name as product_name,
        p.slug as product_slug,
        p.discount_percent,
        (
          SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1
        ) as primary_image,
        c.design_data as customization_data,
        c.preview_image_url as customization_preview
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN customizations c ON ci.customization_id = c.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    const items = itemsRes.rows.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug,
      variantId: item.variant_id,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: parseFloat(item.price_at_time),
      primaryImage: item.customization_preview || item.primary_image,
      customizationId: item.customization_id,
      isCustomized: !!item.customization_id,
      customizationData: item.customization_data,
      totalItemPrice: parseFloat(item.price_at_time) * item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice, 0);

    res.json({
      success: true,
      data: {
        cartId: cart.id,
        items,
        subtotal,
        itemCount: items.reduce((count, item) => count + item.quantity, 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'default-guest-session';
    const userId = req.user ? req.user.id : null;
    const { productId, variantId, size, color, quantity = 1, customizationId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Fetch product base price & discount
    const prodRes = await query(`SELECT base_price, discount_percent FROM products WHERE id = $1`, [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { base_price, discount_percent } = prodRes.rows[0];
    const unitPrice = discount_percent > 0
      ? Math.round(base_price * (1 - discount_percent / 100))
      : parseFloat(base_price);

    // Check if duplicate standard item exists (only if not customized)
    if (!customizationId) {
      const existingItem = await query(
        `SELECT id, quantity FROM cart_items
         WHERE cart_id = $1 AND product_id = $2 AND size = $3 AND color = $4 AND customization_id IS NULL`,
        [cart.id, productId, size, color]
      );

      if (existingItem.rows.length > 0) {
        const newQty = existingItem.rows[0].quantity + parseInt(quantity, 10);
        await query(`UPDATE cart_items SET quantity = $1 WHERE id = $2`, [newQty, existingItem.rows[0].id]);
        return res.json({ success: true, message: 'Cart quantity updated' });
      }
    }

    // Insert new item
    await query(
      `INSERT INTO cart_items (cart_id, product_id, variant_id, size, color, quantity, price_at_time, customization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [cart.id, productId, variantId || null, size, color, parseInt(quantity, 10), unitPrice, customizationId || null]
    );

    res.status(201).json({ success: true, message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (parseInt(quantity, 10) <= 0) {
      await query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    await query(`UPDATE cart_items SET quantity = $1 WHERE id = $2`, [parseInt(quantity, 10), itemId]);
    res.json({ success: true, message: 'Item quantity updated' });
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'default-guest-session';
    const userId = req.user ? req.user.id : null;
    const cart = await getOrCreateCart(userId, sessionId);

    await query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
