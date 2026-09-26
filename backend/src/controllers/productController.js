const { query } = require('../config/db');

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      size,
      color,
      isCustomizable,
      isFeatured,
      isNewArrival,
      search,
      sort = 'newest',
      page = 1,
      limit = 24
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = ['p.is_active = TRUE'];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`(c.slug = $${idx} OR c.id::text = $${idx})`);
      values.push(category);
      idx++;
    }

    if (minPrice) {
      conditions.push(`p.base_price >= $${idx}`);
      values.push(parseFloat(minPrice));
      idx++;
    }

    if (maxPrice) {
      conditions.push(`p.base_price <= $${idx}`);
      values.push(parseFloat(maxPrice));
      idx++;
    }

    if (isCustomizable !== undefined) {
      conditions.push(`p.is_customizable = $${idx}`);
      values.push(isCustomizable === 'true' || isCustomizable === true);
      idx++;
    }

    if (isFeatured !== undefined) {
      conditions.push(`p.is_featured = $${idx}`);
      values.push(isFeatured === 'true' || isFeatured === true);
      idx++;
    }

    if (isNewArrival !== undefined) {
      conditions.push(`p.is_new_arrival = $${idx}`);
      values.push(isNewArrival === 'true' || isNewArrival === true);
      idx++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      values.push(`%${search.trim()}%`);
      idx++;
    }

    if (size) {
      conditions.push(`EXISTS (
        SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = $${idx}
      )`);
      values.push(size);
      idx++;
    }

    if (color) {
      conditions.push(`EXISTS (
        SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.color_name ILIKE $${idx}
      )`);
      values.push(`%${color}%`);
      idx++;
    }

    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderByClause = 'ORDER BY p.base_price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'ORDER BY p.base_price DESC';
    } else if (sort === 'featured') {
      orderByClause = 'ORDER BY p.is_featured DESC, p.created_at DESC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRes = await query(countQuery, values);
    const totalCount = parseInt(countRes.rows[0].total, 10);

    const productsQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.discount_percent,
        p.is_customizable,
        p.is_featured,
        p.is_new_arrival,
        p.sku,
        p.created_at,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT json_agg(json_build_object(
            'id', pi.id,
            'imageUrl', pi.image_url,
            'isPrimary', pi.is_primary,
            'viewType', pi.view_type
          ) ORDER BY pi.is_primary DESC, pi.display_order ASC)
          FROM product_images pi
          WHERE pi.product_id = p.id
        ) as images,
        (
          SELECT jsonb_agg(DISTINCT jsonb_build_object(
            'colorName', pv.color_name,
            'colorHex', pv.color_hex
          ))
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) as colors,
        (
          SELECT jsonb_agg(DISTINCT pv.size)
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) as sizes,
        COALESCE((
          SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'
        ), 5.0) as average_rating,
        COALESCE((
          SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'
        ), 0) as reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(parseInt(limit, 10), offset);
    const productsRes = await query(productsQuery, values);

    res.json({
      success: true,
      data: {
        products: productsRes.rows.map(prod => ({
          ...prod,
          images: prod.images || [],
          colors: prod.colors || [],
          sizes: prod.sizes || [],
          averageRating: parseFloat(prod.average_rating || 5.0).toFixed(1),
          reviewsCount: parseInt(prod.reviews_count || 0, 10),
          discountPrice: prod.discount_percent > 0
            ? Math.round(prod.base_price * (1 - prod.discount_percent / 100))
            : prod.base_price
        })),
        pagination: {
          total: totalCount,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          pages: Math.ceil(totalCount / parseInt(limit, 10))
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const prodRes = await query(
      `SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1 OR p.id::text = $1`,
      [slug]
    );

    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = prodRes.rows[0];

    // Images
    const imagesRes = await query(
      `SELECT id, image_url as "imageUrl", alt_text as "altText", is_primary as "isPrimary", view_type as "viewType"
       FROM product_images
       WHERE product_id = $1
       ORDER BY is_primary DESC, display_order ASC`,
      [product.id]
    );

    // Variants
    const variantsRes = await query(
      `SELECT id, color_name as "colorName", color_hex as "colorHex", size, sku, stock_quantity as "stockQuantity", price_adjustment as "priceAdjustment"
       FROM product_variants
       WHERE product_id = $1
       ORDER BY color_name ASC, size ASC`,
      [product.id]
    );

    // Reviews
    const reviewsRes = await query(
      `SELECT id, user_name as "userName", rating, title, comment, is_verified_purchase as "isVerifiedPurchase", created_at as "createdAt"
       FROM reviews
       WHERE product_id = $1 AND status = 'approved'
       ORDER BY created_at DESC`,
      [product.id]
    );

    // Related products (from same category)
    const relatedRes = await query(
      `SELECT
        p.id, p.name, p.slug, p.base_price, p.discount_percent, p.is_customizable,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = $1 AND p.id != $2 AND p.is_active = TRUE
       LIMIT 4`,
      [product.category_id, product.id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        images: imagesRes.rows,
        variants: variantsRes.rows,
        reviews: reviewsRes.rows,
        relatedProducts: relatedRes.rows.map(r => ({
          ...r,
          discountPrice: r.discount_percent > 0
            ? Math.round(r.base_price * (1 - r.discount_percent / 100))
            : r.base_price
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.display_order ASC`
    );
    res.json({ success: true, data: categories.rows });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const reviewRes = await query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, is_verified_purchase, status)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, 'approved')
       RETURNING *`,
      [productId, req.user ? req.user.id : null, req.user ? req.user.name : 'Verified Customer', rating, title, comment]
    );

    res.status(201).json({ success: true, message: 'Review submitted', data: reviewRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getCategories,
  addReview,
};
