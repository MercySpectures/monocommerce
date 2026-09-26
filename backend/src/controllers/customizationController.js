const { query } = require('../config/db');

const uploadDesignAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const assetRes = await query(
      `INSERT INTO uploaded_assets (user_id, original_filename, stored_filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user ? req.user.id : null,
        req.file.originalname,
        req.file.filename,
        fileUrl,
        req.file.size,
        req.file.mimetype
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully',
      data: {
        id: assetRes.rows[0].id,
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (err) {
    next(err);
  }
};

const createCustomization = async (req, res, next) => {
  try {
    const {
      productId,
      garmentColor = 'Jet Black',
      garmentSize = 'L',
      viewSide = 'front',
      designData,
      previewImageUrl
    } = req.body;

    if (!productId || !designData) {
      return res.status(400).json({ success: false, message: 'Product ID and design data are required' });
    }

    const customRes = await query(
      `INSERT INTO customizations (user_id, product_id, garment_color, garment_size, view_side, design_data, preview_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user ? req.user.id : null,
        productId,
        garmentColor,
        garmentSize,
        viewSide,
        JSON.stringify(designData),
        previewImageUrl || null
      ]
    );

    const customization = customRes.rows[0];

    // If designData has individual elements, also insert into customization_elements for relational tracking
    if (designData.elements && Array.isArray(designData.elements)) {
      for (let i = 0; i < designData.elements.length; i++) {
        const el = designData.elements[i];
        await query(
          `INSERT INTO customization_elements (
            customization_id, element_type, content, font_family, font_size,
            text_color, position_x, position_y, scale, rotation, layer_order, side
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            customization.id,
            el.type || 'text',
            el.content || el.url || '',
            el.fontFamily || null,
            el.fontSize || null,
            el.textColor || null,
            el.x || 0,
            el.y || 0,
            el.scale || 1.0,
            el.rotation || 0,
            i,
            el.side || 'front'
          ]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Design saved successfully',
      data: customization
    });
  } catch (err) {
    next(err);
  }
};

const getCustomization = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customRes = await query(
      `SELECT c.*, p.name as product_name, p.base_price, p.slug as product_slug
       FROM customizations c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (customRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customization not found' });
    }

    const elementsRes = await query(
      `SELECT * FROM customization_elements WHERE customization_id = $1 ORDER BY layer_order ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...customRes.rows[0],
        elements: elementsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDesignAsset,
  createCustomization,
  getCustomization,
};
