// src/models/product.model.js
import pool from '../config/db.js';

// 홈: 오늘의 베스트 (조회수 상위)
export async function getBestProducts(limit = 8) {
  const [rows] = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.price_krw        AS price,
       p.discount_percentage,
       p.thumbnail_url,
       p.view_count,
       b.name             AS brand_name
     FROM products p
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     WHERE p.is_sold_out = 0
     ORDER BY p.view_count DESC, p.product_id DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

// 홈: 신상
export async function getNewProducts(limit = 12) {
  const [rows] = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.price_krw        AS price,
       p.discount_percentage,
       p.thumbnail_url,
       p.view_count,
       b.name             AS brand_name
     FROM products p
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     WHERE p.is_sold_out = 0
     ORDER BY p.created_at DESC, p.product_id DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

// 목록 + 필터 (groupCode: TOP/BTM/SHOES/ACC, keyword: 검색어)
export async function getProductList({ page = 1, limit = 20, groupCode, keyword }) {
  const offset = (page - 1) * limit;

  let where = 'p.is_sold_out = 0';
  const params = [];

  if (groupCode) {
    where += ' AND cg.code = ?';
    params.push(groupCode); // TOP, BTM, SHOES, ACC
  }

  if (keyword) {
    where += ' AND (p.name LIKE ? OR b.name LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const [rows] = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.price_krw        AS price,
       p.discount_percentage,
       p.thumbnail_url,
       p.view_count,
       b.name             AS brand_name,
       cg.code            AS group_code,
       cg.name            AS group_name,
       c.name             AS category_name
     FROM products p
     JOIN categories c        ON p.category_id = c.category_id
     JOIN category_groups cg  ON c.group_id = cg.group_id
     LEFT JOIN brands b       ON p.brand_id = b.brand_id
     WHERE ${where}
     ORDER BY p.created_at DESC, p.product_id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM products p
     JOIN categories c        ON p.category_id = c.category_id
     JOIN category_groups cg  ON c.group_id = cg.group_id
     LEFT JOIN brands b       ON p.brand_id = b.brand_id
     WHERE ${where}`,
    params
  );

  return { products: rows, total };
}

// 단일 상품 상세
export async function getProductById(productId) {
  const [rows] = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.description,
       p.price_krw        AS price,
       p.discount_percentage,
       p.stock,
       p.thumbnail_url,
       p.view_count,
       p.created_at,
       b.name             AS brand_name,
       c.name             AS category_name,
       cg.name            AS group_name
     FROM products p
     JOIN categories c        ON p.category_id = c.category_id
     JOIN category_groups cg  ON c.group_id = cg.group_id
     LEFT JOIN brands b       ON p.brand_id = b.brand_id
     WHERE p.product_id = ?`,
    [productId]
  );
  return rows[0] || null;
}
