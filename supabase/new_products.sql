-- ============================================
-- PESTICIDE PRODUCTS DATABASE SETUP
-- Based on Real Australian Products (PDF)
-- ============================================

-- 1) ADD NEW INGREDIENTS
INSERT INTO ingredients (name, risk_level, score_penalty, concerns) VALUES
  -- Existing ingredients (if not already added)
  ('Glyphosate', 'high', 35, 'Possible carcinogenicity concern; environmental toxicity concern'),
  ('Pyrethrin', 'medium', 20, 'May affect aquatic organisms; moderate toxicity concern'),
  ('Citric Acid', 'low', 5, 'Generally lower concern'),
  ('Acetic Acid', 'low', 5, 'Lower concern but may cause irritation'),
  
  -- New ingredients from PDF
  ('Pelargonic Acid', 'medium', 15, 'Can cause serious eye damage and skin irritation risks; classified as hazardous'),
  ('Sodium Chloride', 'low', 5, 'Common salt; lower toxicity but can affect soil'),
  ('Carbaryl', 'high', 35, 'Contains 100 g/L carbaryl with significant toxicological concerns; effects on nervous system'),
  ('White Oil', 'low', 8, 'Physical control method; minimal harm but can affect beneficial insects'),
  ('Pyrethrum', 'high', 30, 'Highly toxic to aquatic life and beneficial insects'),
  ('Insecticidal Soap', 'low', 8, 'Organic approved; minimal harm to beneficial insects but may affect sensitive plants'),
  ('Garlic Extract', 'low', 5, 'Natural repellent; minimal concern'),
  ('Chilli Extract', 'low', 5, 'Natural repellent; minimal concern'),
  ('Simazine', 'high', 30, 'Weed-killing chemical posing environmental and human health risks'),
  ('Amitrole', 'high', 32, 'Weed-killing chemical posing environmental and human health risks');

-- 2) ADD PRODUCTS WITH REAL BARCODES FROM PDF
INSERT INTO products (barcode, name, brand, category, image_url) VALUES
  -- Product 1: Roundup 1L Natural Weedkiller
  ('9311105008992', 'Roundup 1L Natural Weedkiller', 'Roundup', 'Herbicide', '/products/roundup.jpg'),
  
  -- Product 2: Seasol 4L For Lush Green Lawns Concentrate
  ('9320124232813', 'Seasol 4L For Lush Green Lawns Concentrate', 'Seasol', 'Fertilizer', '/products/seasol-lawns.jpg'),
  
  -- Product 3: Brunnings 1.2L Ready To Use Path Weeder
  ('9310522100289', 'Brunnings 1.2L Ready To Use Path Weeder', 'Brunnings', 'Herbicide', '/products/brunnings-path-weeder.jpg'),
  
  -- Product 4: Seasol 1L EarthCare White Oil Insect Spray
  ('9320124232561', 'Seasol 1L EarthCare White Oil Insect Spray', 'Seasol', 'Insecticide', '/products/seasol-white-oil.jpg'),
  
  -- Product 5: Richgro 1L Beat-A-Bug Naturally Based Insect Spray
  ('9318154288672', 'Richgro 1L Beat-A-Bug Naturally Based Insect Spray', 'Richgro', 'Insecticide', '/products/richgro-beat-a-bug.jpg'),
  
  -- Product 6: OCP 750ml Ready to Use Eco-Insect Killer
  ('9310428571855', 'OCP 750ml Ready to Use Eco-Insect Killer', 'OCP', 'Insecticide', '/products/ocp-eco-insect-killer.jpg'),
  
  -- Product 7: Seasol 1L EarthCare Organic Weedkiller Concentrate
  ('9320124232592', 'Seasol 1L EarthCare Organic Weedkiller Concentrate', 'Seasol', 'Herbicide', '/products/seasol-organic-weedkiller.jpg'),
  
  -- Product 8: Richgro 250ml Caterpillar Grasshopper and Millipede Killer
  ('9312324080356', 'Richgro 250ml Caterpillar Grasshopper and Millipede Killer', 'Richgro', 'Insecticide', '/products/richgro-caterpillar-killer.jpg'),
  
  -- Product 9: Richgro 1L Beat-A-Weed Natural Weedkiller Concentrate
  ('9312324071026', 'Richgro 1L Beat-A-Weed Natural Weedkiller Concentrate', 'Richgro', 'Herbicide', '/products/richgro-beat-a-weed.jpg'),
  
  -- Product 10: OCP 750ml Ready to Use Eco-Pyrethrum PLUS
  ('9310428571848', 'OCP 750ml Ready to Use Eco-Pyrethrum PLUS', 'OCP', 'Insecticide', '/products/ocp-eco-pyrethrum.jpg');

-- 3) LINK PRODUCTS TO INGREDIENTS

-- Product 1: Roundup 1L Natural Weedkiller (Score: 85/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Citric Acid'
WHERE p.barcode = '9311105008992';

-- Product 2: Seasol 4L For Lush Green Lawns Concentrate (Score: 95/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Citric Acid'
WHERE p.barcode = '9320124232813';

-- Product 3: Brunnings 1.2L Ready To Use Path Weeder (Score: 45/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name IN ('Simazine', 'Amitrole')
WHERE p.barcode = '9310522100289';

-- Product 4: Seasol 1L EarthCare White Oil Insect Spray (Score: 85/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'White Oil'
WHERE p.barcode = '9320124232561';

-- Product 5: Richgro 1L Beat-A-Bug Naturally Based Insect Spray (Score: 70/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name IN ('Garlic Extract', 'Chilli Extract', 'Pyrethrin')
WHERE p.barcode = '9318154288672';

-- Product 6: OCP 750ml Ready to Use Eco-Insect Killer (Score: 90/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Insecticidal Soap'
WHERE p.barcode = '9310428571855';

-- Product 7: Seasol 1L EarthCare Organic Weedkiller Concentrate (Score: 80/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Pelargonic Acid'
WHERE p.barcode = '9320124232592';

-- Product 8: Richgro 250ml Caterpillar Grasshopper and Millipede Killer (Score: 45/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Carbaryl'
WHERE p.barcode = '9312324080356';

-- Product 9: Richgro 1L Beat-A-Weed Natural Weedkiller Concentrate (Score: 75/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name IN ('Acetic Acid', 'Sodium Chloride')
WHERE p.barcode = '9312324071026';

-- Product 10: OCP 750ml Ready to Use Eco-Pyrethrum PLUS (Score: 70/100)
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT p.id, i.id FROM products p JOIN ingredients i ON i.name = 'Pyrethrum'
WHERE p.barcode = '9310428571848';

-- 4) VERIFY SETUP
SELECT COUNT(*) as total_ingredients FROM ingredients;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_links FROM product_ingredients;

-- 5) VIEW PRODUCT DETAILS
SELECT 
  p.id,
  p.barcode,
  p.name,
  p.brand,
  p.category,
  COUNT(pi.ingredient_id) as ingredient_count,
  STRING_AGG(i.name, ', ') as ingredients
FROM products p
LEFT JOIN product_ingredients pi ON p.id = pi.product_id
LEFT JOIN ingredients i ON pi.ingredient_id = i.id
GROUP BY p.id, p.barcode, p.name, p.brand, p.category
ORDER BY p.id;