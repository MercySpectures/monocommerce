const { query } = require('../config/db');

// 1. Dashboard Overview Stats
const getDashboardStats = async (req, res, next) => {
  try {
    const statsQuery = `
      SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')) as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as completed_orders,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'customer') as total_customers,
        (SELECT COUNT(*) FROM product_variants WHERE stock_quantity <= 5) as low_stock_count
    `;
    const statsRes = await query(statsQuery);

    // Recent orders
    const recentOrdersRes = await query(
      `SELECT id, order_number, customer_name, customer_email, total_amount, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 8`
    );

    // Low stock items
    const lowStockRes = await query(
      `SELECT pv.id, p.name as product_name, pv.color_name, pv.size, pv.sku, pv.stock_quantity
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.stock_quantity <= 8
       ORDER BY pv.stock_quantity ASC
       LIMIT 8`
    );

    // Top selling products
    const topProductsRes = await query(
      `SELECT oi.product_name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as total_sales
       FROM order_items oi
       GROUP BY oi.product_name
       ORDER BY total_sales DESC
       LIMIT 5`
    );

    // Revenue history (mock aggregated points for crisp monochrome chart)
    const revenueTrend = [
      { day: 'Mon', revenue: 14200, orders: 4 },
      { day: 'Tue', revenue: 21500, orders: 6 },
      { day: 'Wed', revenue: 18900, orders: 5 },
      { day: 'Thu', revenue: 32000, orders: 9 },
      { day: 'Fri', revenue: 28400, orders: 7 },
      { day: 'Sat', revenue: 45600, orders: 12 },
      { day: 'Sun', revenue: 39800, orders: 11 },
    ];

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: parseFloat(statsRes.rows[0].total_revenue),
          totalOrders: parseInt(statsRes.rows[0].total_orders, 10),
          pendingOrders: parseInt(statsRes.rows[0].pending_orders, 10),
          completedOrders: parseInt(statsRes.rows[0].completed_orders, 10),
          totalCustomers: parseInt(statsRes.rows[0].total_customers, 10),
          lowStockCount: parseInt(statsRes.rows[0].low_stock_count, 10),
        },
        recentOrders: recentOrdersRes.rows,
        lowStockItems: lowStockRes.rows,
        topProducts: topProductsRes.rows,
        revenueTrend,
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. All Orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const values = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (search) {
      conditions.push(`(order_number ILIKE $${idx} OR customer_name ILIKE $${idx} OR customer_email ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as total FROM orders ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const ordersQuery = `
      SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id AND customization_id IS NOT NULL) as has_customization
      FROM orders o
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(parseInt(limit, 10), offset);
    const ordersRes = await query(ordersQuery, values);

    res.json({
      success: true,
      data: {
        orders: ordersRes.rows,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const updateRes = await query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           tracking_number = COALESCE($2, tracking_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $3 OR order_number = $3
       RETURNING *`,
      [status, trackingNumber, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated', data: updateRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

// 3. Custom Orders Studio Hub
const getCustomOrders = async (req, res, next) => {
  try {
    const customOrdersRes = await query(
      `SELECT
        oi.id as order_item_id,
        oi.order_id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.created_at,
        o.status as order_status,
        oi.product_name,
        oi.color,
        oi.size,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        c.id as customization_id,
        c.garment_color,
        c.garment_size,
        c.view_side,
        c.design_data,
        c.preview_image_url
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN customizations c ON oi.customization_id = c.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      data: customOrdersRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Products Management (Admin)
const getProductsAdmin = async (req, res, next) => {
  try {
    const prodRes = await query(
      `SELECT p.*, c.name as category_name,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
        COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id), 0) as total_stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: prodRes.rows });
  } catch (err) {
    next(err);
  }
};

const createProductAdmin = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      categoryId,
      basePrice,
      discountPercent = 0,
      isCustomizable = false,
      isFeatured = false,
      isNewArrival = false,
      sku,
      description,
      details,
      fabricCare,
      imageUrl,
      variants = [],
    } = req.body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const insertProd = await query(
      `INSERT INTO products (
        name, slug, category_id, base_price, discount_percent,
        is_customizable, is_featured, is_new_arrival, sku,
        description, details, fabric_care, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE)
      RETURNING *`,
      [
        name,
        generatedSlug,
        categoryId || null,
        basePrice,
        discountPercent,
        isCustomizable,
        isFeatured,
        isNewArrival,
        sku || `MC-${Math.floor(1000 + Math.random() * 9000)}`,
        description || '',
        details || '',
        fabricCare || '',
      ]
    );

    const product = insertProd.rows[0];

    // Primary image
    if (imageUrl) {
      await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
         VALUES ($1, $2, $3, TRUE, 0)`,
        [product.id, imageUrl, name]
      );
    }

    // Default variants if not provided
    const defaultVariants = variants.length > 0 ? variants : [
      { colorName: 'Jet Black', colorHex: '#0A0A0A', size: 'M', stock: 20 },
      { colorName: 'Jet Black', colorHex: '#0A0A0A', size: 'L', stock: 20 },
      { colorName: 'Pure White', colorHex: '#FFFFFF', size: 'M', stock: 15 },
      { colorName: 'Pure White', colorHex: '#FFFFFF', size: 'L', stock: 15 },
    ];

    for (const v of defaultVariants) {
      const vSku = `${product.sku}-${v.colorName.slice(0, 2).toUpperCase()}-${v.size}`;
      const varRes = await query(
        `INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [product.id, v.colorName, v.colorHex || '#0A0A0A', v.size, vSku, v.stock || 10]
      );
      if (varRes.rows.length > 0) {
        await query(
          `INSERT INTO inventory (product_id, variant_id, current_stock) VALUES ($1, $2, $3)`,
          [product.id, varRes.rows[0].id, v.stock || 10]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (err) {
    next(err);
  }
};

const updateProductAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      basePrice,
      discountPercent,
      isCustomizable,
      isFeatured,
      isNewArrival,
      isActive,
      description,
      details,
      fabricCare,
      imageUrl,
    } = req.body;

    const updateRes = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           category_id = COALESCE($2, category_id),
           base_price = COALESCE($3, base_price),
           discount_percent = COALESCE($4, discount_percent),
           is_customizable = COALESCE($5, is_customizable),
           is_featured = COALESCE($6, is_featured),
           is_new_arrival = COALESCE($7, is_new_arrival),
           is_active = COALESCE($8, is_active),
           description = COALESCE($9, description),
           details = COALESCE($10, details),
           fabric_care = COALESCE($11, fabric_care),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name, categoryId, basePrice, discountPercent, isCustomizable, isFeatured, isNewArrival, isActive, description, details, fabricCare, id]
    );

    if (imageUrl) {
      await query(`UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = TRUE`, [imageUrl, id]);
    }

    res.json({ success: true, message: 'Product updated', data: updateRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteProductAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`UPDATE products SET is_active = FALSE WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

// 5. Inventory Management
const getInventoryAdmin = async (req, res, next) => {
  try {
    const inventoryRes = await query(
      `SELECT
        pv.id as variant_id,
        pv.sku,
        pv.color_name,
        pv.color_hex,
        pv.size,
        pv.stock_quantity,
        p.id as product_id,
        p.name as product_name,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY pv.stock_quantity ASC, p.name ASC`
    );
    res.json({ success: true, data: inventoryRes.rows });
  } catch (err) {
    next(err);
  }
};

const updateInventoryStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { stockQuantity } = req.body;

    const resUpdate = await query(
      `UPDATE product_variants SET stock_quantity = $1 WHERE id = $2 RETURNING *`,
      [stockQuantity, variantId]
    );

    res.json({ success: true, message: 'Stock updated', data: resUpdate.rows[0] });
  } catch (err) {
    next(err);
  }
};

// 6. Customers Management
const getCustomersAdmin = async (req, res, next) => {
  try {
    const customersRes = await query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE r.name = 'customer'
       GROUP BY u.id
       ORDER BY total_spent DESC`
    );
    res.json({ success: true, data: customersRes.rows });
  } catch (err) {
    next(err);
  }
};

// 7. Coupons Management
const getCouponsAdmin = async (req, res, next) => {
  try {
    const couponsRes = await query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    res.json({ success: true, data: couponsRes.rows });
  } catch (err) {
    next(err);
  }
};

const createCouponAdmin = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount = 0, maxDiscountAmount, expiresAt } = req.body;

    const insertRes = await query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [code.toUpperCase().trim(), discountType, discountValue, minOrderAmount, maxDiscountAmount || null, expiresAt || null]
    );

    res.status(201).json({ success: true, message: 'Coupon created', data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteCouponAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM coupons WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

// 8. Reviews Moderation
const getReviewsAdmin = async (req, res, next) => {
  try {
    const reviewsRes = await query(
      `SELECT r.*, p.name as product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: reviewsRes.rows });
  } catch (err) {
    next(err);
  }
};

const updateReviewStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'
    await query(`UPDATE reviews SET status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true, message: `Review ${status}` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getCustomOrders,
  getProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getInventoryAdmin,
  updateInventoryStock,
  getCustomersAdmin,
  getCouponsAdmin,
  createCouponAdmin,
  deleteCouponAdmin,
  getReviewsAdmin,
  updateReviewStatusAdmin,
};
