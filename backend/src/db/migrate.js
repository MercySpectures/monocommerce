const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

async function migrateAndSeed() {
  console.log('--- Starting MonoCommerce Migration & Seed ---');
  try {
    // 1. Read and apply schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 2. Roles
    const adminRoleRes = await query(
      `INSERT INTO roles (name, description) VALUES ('admin', 'Administrator with full system privileges')
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id`
    );
    const customerRoleRes = await query(
      `INSERT INTO roles (name, description) VALUES ('customer', 'Regular customer user')
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id`
    );

    const adminRoleId = adminRoleRes.rows[0].id;
    const customerRoleId = customerRoleRes.rows[0].id;

    // 3. Admin & Demo Customer Users
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('admin123', salt);
    const customerPassHash = await bcrypt.hash('customer123', salt);

    const adminUserRes = await query(
      `INSERT INTO users (name, email, password_hash, role_id, phone)
       VALUES ('MonoCommerce Admin', 'admin@monocommerce.com', $1, $2, '+91 9876543210')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role_id = $2
       RETURNING id`,
      [adminPassHash, adminRoleId]
    );

    const customerUserRes = await query(
      `INSERT INTO users (name, email, password_hash, role_id, phone)
       VALUES ('Devin Vance', 'customer@monocommerce.com', $1, $2, '+91 9876501234')
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, role_id = $2
       RETURNING id`,
      [customerPassHash, customerRoleId]
    );

    const adminUserId = adminUserRes.rows[0].id;
    const customerUserId = customerUserRes.rows[0].id;

    // Default address for customer
    await query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, is_default)
       VALUES ($1, 'Devin Vance', '+91 9876501234', 'Apt 4B, Monochrome Tower, Indiranagar', '100ft Road', 'Bengaluru', 'Karnataka', '560038', TRUE)
       ON CONFLICT DO NOTHING`,
      [customerUserId]
    );

    // 4. Categories
    const categoriesData = [
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Heavyweight 280-320 GSM combed cotton. Oversized and boxy silhouettes designed for archival wear and customization.',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        display_order: 1
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Architectural 450 GSM French Terry fleeces. Double-lined hoods, concealed pockets and minimal monochrome detailing.',
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
        display_order: 2
      },
      {
        name: 'Caps',
        slug: 'caps',
        description: 'Unstructured low-profile 6-panel headwear in dense brushed cotton twill with tonal embroidery.',
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop',
        display_order: 3
      },
      {
        name: 'Bags',
        slug: 'bags',
        description: 'Industrial 18oz canvas and ballistic nylon carriers engineered for functional daily utility.',
        image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
        display_order: 4
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Understated matte black and polished silver hardware, key loops and technical accessories.',
        image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
        display_order: 5
      }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const res = await query(
        `INSERT INTO categories (name, slug, description, image_url, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3, image_url = $4
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.display_order]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 5. Products
    const productsData = [
      {
        name: 'Archival Heavyweight T-Shirt',
        slug: 'archival-heavyweight-tshirt',
        category_slug: 't-shirts',
        base_price: 2490.00,
        discount_percent: 15.00,
        is_customizable: true,
        is_featured: true,
        is_new_arrival: false,
        sku: 'MC-TS-001',
        description: 'Meticulously crafted from bespoke 280 GSM dry-touch organic cotton. Designed with a wide drop-shoulder fit, thick 1.25" bound ribbed collar, and pre-shrunk finish for enduring structure.',
        details: '• 280 GSM 100% Combed Compact Cotton\n• Pre-shrunk to retain boxy silhouette\n• Clean blind-stitch hems\n• Custom studio ready\n• Made in limited batches',
        fabric_care: 'Machine wash cold inside-out with like colors. Hang dry in shade. Cool iron on reverse. Do not bleach or dry clean.',
        images: [
          { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop', view_type: 'model', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop', view_type: 'back', is_primary: false }
        ]
      },
      {
        name: 'Signature Boxy Monochrome Hoodie',
        slug: 'signature-boxy-monochrome-hoodie',
        category_slug: 'hoodies',
        base_price: 5490.00,
        discount_percent: 10.00,
        is_customizable: false,
        is_featured: true,
        is_new_arrival: false,
        sku: 'MC-HD-001',
        description: 'An architectural staple. Cut in heavyweight 450 GSM diagonal-loop French Terry with a crossover double-layered hood without drawstrings for an uncompromising minimal neckline.',
        details: '• 450 GSM Heavyweight French Terry\n• Structured double-layer hood without drawstrings\n• Concealed side-seam hand pockets\n• Ribbed side-gusset panels for effortless movement\n• Tonal silicone-embossed insignia at cuff',
        fabric_care: 'Gentle machine wash at 30°C. Reshape while damp and lay flat to dry. Do not tumble dry.',
        images: [
          { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop', view_type: 'model', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false }
        ]
      },
      {
        name: 'Minimal Structured 6-Panel Cap',
        slug: 'minimal-structured-cap',
        category_slug: 'caps',
        base_price: 1890.00,
        discount_percent: 0.00,
        is_customizable: false,
        is_featured: true,
        is_new_arrival: false,
        sku: 'MC-CP-001',
        description: 'Low-profile unstructured silhouette constructed from high-density washed cotton twill. Features tonal eyelets and an antique matte-black brass buckle strap slider.',
        details: '• 100% Washed Cotton Twill\n• Unstructured 6-panel design\n• Adjustable tonal backstrap with matte metal slider\n• Interior moisture-wicking sweatband\n• One size fits all (54-61cm)',
        fabric_care: 'Spot clean with a damp cloth and mild neutral detergent. Air dry naturally.',
        images: [
          { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false }
        ]
      },
      {
        name: 'Industrial Heavy Canvas Tote Bag',
        slug: 'heavy-canvas-tote-bag',
        category_slug: 'bags',
        base_price: 2190.00,
        discount_percent: 0.00,
        is_customizable: false,
        is_featured: true,
        is_new_arrival: false,
        sku: 'MC-BG-001',
        description: 'Constructed from indestructible 18oz raw unbleached canvas. Features reinforced box-x stitched shoulder handles, interior zippered pocket for laptop accessories, and dual snap closures.',
        details: '• 18oz Extra-Dense Cotton Duck Canvas\n• Reinforced dual handles with 11" shoulder drop\n• Internal YKK zip pocket for 16" laptop and essentials\n• Structured flat base stands upright\n• Matte black hardware',
        fabric_care: 'Spot clean only with cold water. Avoid machine washing to preserve canvas stiffness.',
        images: [
          { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false }
        ]
      },
      {
        name: 'Oversized Drop-Shoulder Studio T-Shirt',
        slug: 'oversized-drop-shoulder-studio-tshirt',
        category_slug: 't-shirts',
        base_price: 2890.00,
        discount_percent: 20.00,
        is_customizable: true,
        is_featured: true,
        is_new_arrival: true,
        sku: 'MC-TS-002',
        description: 'Exaggerated streetwear proportions engineered for both solo editorial wear and bespoke graphic customization. Features a dropped shoulder seam and lengthened half-sleeve drape.',
        details: '• 300 GSM Heavy Combed Cotton Jersey\n• Dropped shoulders with relaxed drape\n• High rib neck collar that never sags\n• Double-needle reinforcement\n• Custom studio canvas support (Front & Back)',
        fabric_care: 'Cold wash. Dry flat. Iron low on reverse.',
        images: [
          { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop', view_type: 'model', is_primary: false }
        ]
      },
      {
        name: 'Archival Dual-Zip Heavyweight Hoodie',
        slug: 'archival-dual-zip-hoodie',
        category_slug: 'hoodies',
        base_price: 5990.00,
        discount_percent: 0.00,
        is_customizable: false,
        is_featured: false,
        is_new_arrival: true,
        sku: 'MC-HD-002',
        description: 'Featuring two-way matte-black industrial YKK zippers allowing versatile styling and silhouette modifications. Finished with heavy 2x2 ribbed cuffs and waist.',
        details: '• 480 GSM Heavy Loopback Cotton\n• Two-way matte black YKK zipper\n• Oversized ergonomic hood\n• Reinforced elbow articulation',
        fabric_care: 'Zip completely before washing. Cold delicate cycle.',
        images: [
          { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false }
        ]
      },
      {
        name: 'Technical Modular Crossbody Bag',
        slug: 'technical-modular-crossbody-bag',
        category_slug: 'bags',
        base_price: 3490.00,
        discount_percent: 15.00,
        is_customizable: false,
        is_featured: false,
        is_new_arrival: true,
        sku: 'MC-BG-002',
        description: 'Water-resistant Cordura® ballistic nylon sling with Fidlock-inspired magnetic quick-release buckle. Modular MOLLE attachment loops and weather-sealed YKK Aquaguard zips.',
        details: '• 1000D Cordura® Ballistic Nylon\n• Quick-release magnetic buckle strap\n• Weather-sealed Aquaguard zippers\n• 4.5L storage capacity with tablet divider',
        fabric_care: 'Wipe with microfiber cloth and warm water.',
        images: [
          { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true }
        ]
      },
      {
        name: 'Archival Washed Relaxed Crewneck',
        slug: 'archival-washed-relaxed-crewneck',
        category_slug: 'hoodies',
        base_price: 4290.00,
        discount_percent: 10.00,
        is_customizable: false,
        is_featured: true,
        is_new_arrival: false,
        sku: 'MC-SW-001',
        description: 'Vintage pigment-washed dark charcoal crewneck. Features dropped shoulders, a relaxed athletic torso, and subtle distressed ribbing details at the cuffs and hem.',
        details: '• 400 GSM Mineral Washed Cotton\n• Unique tonal garment dye patina\n• Relaxed athletic boxy cut\n• Heavy ribbed collar and cuffs',
        fabric_care: 'Wash separately on initial wash due to pigment wash.',
        images: [
          { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop', view_type: 'front', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', view_type: 'detail', is_primary: false }
        ]
      }
    ];

    const standardSizes = ['S', 'M', 'L', 'XL'];
    const standardColors = [
      { name: 'Jet Black', hex: '#0A0A0A' },
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Charcoal Gray', hex: '#262626' },
      { name: 'Heather Slate', hex: '#737373' }
    ];

    for (const p of productsData) {
      const catId = categoryMap[p.category_slug];
      const prodRes = await query(
        `INSERT INTO products (name, slug, description, details, fabric_care, category_id, base_price, discount_percent, is_customizable, is_featured, is_new_arrival, sku)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO UPDATE SET
           name = $1, description = $3, details = $4, fabric_care = $5, category_id = $6,
           base_price = $7, discount_percent = $8, is_customizable = $9, is_featured = $10, is_new_arrival = $11, sku = $12
         RETURNING id`,
        [p.name, p.slug, p.description, p.details, p.fabric_care, catId, p.base_price, p.discount_percent, p.is_customizable, p.is_featured, p.is_new_arrival, p.sku]
      );
      const productId = prodRes.rows[0].id;

      // Images
      let imgOrder = 0;
      for (const img of p.images) {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order, view_type)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [productId, img.url, p.name, img.is_primary, imgOrder++, img.view_type]
        );
      }

      // Variants & Inventory
      for (const col of standardColors) {
        for (const sz of standardSizes) {
          const variantSku = `${p.sku}-${col.name.slice(0, 2).toUpperCase()}-${sz}`;
          const varRes = await query(
            `INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (sku) DO UPDATE SET stock_quantity = $6
             RETURNING id`,
            [productId, col.name, col.hex, sz, variantSku, Math.floor(Math.random() * 25) + 10]
          );

          if (varRes.rows.length > 0) {
            const variantId = varRes.rows[0].id;
            await query(
              `INSERT INTO inventory (product_id, variant_id, current_stock, reserved_stock, low_stock_threshold)
               VALUES ($1, $2, $3, 0, 5)
               ON CONFLICT DO NOTHING`,
              [productId, variantId, 25]
            );
          }
        }
      }

      // Reviews
      await query(
        `INSERT INTO reviews (product_id, user_name, rating, title, comment, is_verified_purchase, status)
         VALUES
         ($1, 'Marcus K.', 5, 'Exceptional weight and drape', 'The 280 GSM weight is extraordinary. Deep saturated black that retains its structure after multiple washes.', TRUE, 'approved'),
         ($1, 'Elena R.', 5, 'Editorial minimalism at its finest', 'The fit is razor-sharp. Seamlessly fits into high-fashion archival rotations. Highly recommended.', TRUE, 'approved')
         ON CONFLICT DO NOTHING`,
        [productId]
      );
    }

    // 6. Coupons
    const couponsData = [
      { code: 'MONO10', discount_type: 'percentage', discount_value: 10, min_order_amount: 1500, max_discount_amount: 1000 },
      { code: 'ARCHIVE20', discount_type: 'percentage', discount_value: 20, min_order_amount: 4000, max_discount_amount: 2500 },
      { code: 'FREESHIP', discount_type: 'fixed', discount_value: 250, min_order_amount: 2000, max_discount_amount: 250 }
    ];

    for (const c of couponsData) {
      await query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (code) DO UPDATE SET discount_value = $3, min_order_amount = $4, is_active = TRUE`,
        [c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount]
      );
    }

    // 7. Seed Sample Customization & Orders (for instant Admin & Order demo)
    const tShirtRes = await query(`SELECT id FROM products WHERE slug = 'archival-heavyweight-tshirt' LIMIT 1`);
    if (tShirtRes.rows.length > 0) {
      const tshirtId = tShirtRes.rows[0].id;
      const customRes = await query(
        `INSERT INTO customizations (user_id, product_id, garment_color, garment_size, view_side, design_data, preview_image_url)
         VALUES ($1, $2, 'Jet Black', 'L', 'front',
           $3,
           'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop')
         RETURNING id`,
        [
          customerUserId,
          tshirtId,
          JSON.stringify({
            elements: [
              {
                id: 'el-1',
                type: 'text',
                content: 'ARCHIVAL THEORY',
                fontFamily: 'Manrope',
                fontSize: 28,
                textColor: '#FFFFFF',
                x: 180,
                y: 190,
                rotation: 0,
                scale: 1,
                side: 'front'
              },
              {
                id: 'el-2',
                type: 'text',
                content: 'EDITION 001 // BENGALURU',
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                textColor: '#A3A3A3',
                x: 180,
                y: 230,
                rotation: 0,
                scale: 1,
                side: 'front'
              }
            ]
          })
        ]
      );

      const customId = customRes.rows[0].id;

      // Seed 2 realistic orders
      const order1Res = await query(
        `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_cost, discount_amount, tax_amount, total_amount, coupon_code, status, tracking_number)
         VALUES ('MC-984210', $1, 'Devin Vance', 'customer@monocommerce.com', '+91 9876501234',
           $2,
           4980.00, 0.00, 498.00, 224.10, 4706.10, 'MONO10', 'processing', 'BLR-EXP-992144')
         ON CONFLICT (order_number) DO NOTHING
         RETURNING id`,
        [
          customerUserId,
          JSON.stringify({
            fullName: 'Devin Vance',
            addressLine1: 'Apt 4B, Monochrome Tower, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            country: 'India',
            phone: '+91 9876501234'
          })
        ]
      );

      if (order1Res.rows.length > 0) {
        const orderId = order1Res.rows[0].id;
        // Insert custom item
        await query(
          `INSERT INTO order_items (order_id, product_id, product_name, color, size, quantity, unit_price, total_price, customization_id, customization_snapshot)
           VALUES ($1, $2, 'Archival Heavyweight T-Shirt (Customized Edition)', 'Jet Black', 'L', 2, 2490.00, 4980.00, $3, $4)`,
          [
            orderId,
            tshirtId,
            customId,
            JSON.stringify({
              customizationId: customId,
              text: 'ARCHIVAL THEORY',
              preview: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
            })
          ]
        );

        // Payment record
        await query(
          `INSERT INTO payments (order_id, payment_method, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status)
           VALUES ($1, 'razorpay', 'order_mono_mock_001', 'pay_mono_mock_9921', 'sig_valid_verified_hash', 4706.10, 'INR', 'captured')`,
          [orderId]
        );
      }
    }

    console.log('✓ Seed data populated successfully.');
    console.log('--- Migration Complete ---');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateAndSeed();
