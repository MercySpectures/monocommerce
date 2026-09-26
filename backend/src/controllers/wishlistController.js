const { query } = require('../config/db');

async function getOrCreateWishlist(userId) {
  let res = await query(`SELECT id FROM wishlists WHERE user_id = $1`, [userId]);
  if (res.rows.length === 0) {
    res = await query(`INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id`, [userId]);
  }
  return res.rows[0].id;
}

const getWishlist = async (req, res, next) => {
  try {
    const wishlistId = await getOrCreateWishlist(req.user.id);

    const itemsRes = await query(
      `SELECT
        p.id,
        p.name,
        p.slug,
        p.base_price,
        p.discount_percent,
        p.is_customizable,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       WHERE wi.wishlist_id = $1
       ORDER BY wi.created_at DESC`,
      [wishlistId]
    );

    res.json({
      success: true,
      data: itemsRes.rows.map(p => ({
        ...p,
        discountPrice: p.discount_percent > 0
          ? Math.round(p.base_price * (1 - p.discount_percent / 100))
          : p.base_price
      }))
    });
  } catch (err) {
    next(err);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const wishlistId = await getOrCreateWishlist(req.user.id);

    const existing = await query(
      `SELECT id FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`,
      [wishlistId, productId]
    );

    let isSaved = false;
    if (existing.rows.length > 0) {
      await query(`DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2`, [wishlistId, productId]);
      isSaved = false;
    } else {
      await query(`INSERT INTO wishlist_items (wishlist_id, product_id) VALUES ($1, $2)`, [wishlistId, productId]);
      isSaved = true;
    }

    res.json({
      success: true,
      data: { isSaved }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
