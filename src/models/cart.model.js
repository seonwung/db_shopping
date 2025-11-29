// src/models/cart.model.js
import pool from '../config/db.js';

// 유저 장바구니 목록 조회
export async function getCartItemsByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT
       ci.cart_item_id,
       ci.quantity,
       p.product_id,
       p.name,
       p.price_krw          AS price,
       p.discount_percentage,
       p.thumbnail_url,
       b.name               AS brand_name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.product_id
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return rows;
}

// 장바구니에 해당 상품 있는지 확인
export async function findCartItem(userId, productId) {
  const [rows] = await pool.query(
    `SELECT *
     FROM cart_items
     WHERE user_id = ? AND product_id = ?`,
    [userId, productId]
  );
  return rows[0] || null;
}

// 장바구니에 새로 추가
export async function insertCartItem(userId, productId, quantity) {
  const [result] = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)`,
    [userId, productId, quantity]
  );
  return result.insertId;
}

// 장바구니 수량 업데이트
export async function updateCartItemQuantity(cartItemId, userId, quantity) {
  const [result] = await pool.query(
    `UPDATE cart_items
     SET quantity = ?
     WHERE cart_item_id = ? AND user_id = ?`,
    [quantity, cartItemId, userId]
  );
  return result.affectedRows;
}

// 장바구니 아이템 삭제
export async function deleteCartItem(cartItemId, userId) {
  const [result] = await pool.query(
    `DELETE FROM cart_items
     WHERE cart_item_id = ? AND user_id = ?`,
    [cartItemId, userId]
  );
  return result.affectedRows;
}

// 유저 장바구니 비우기
export async function clearCartByUserId(userId) {
  const [result] = await pool.query(
    `DELETE FROM cart_items
     WHERE user_id = ?`,
    [userId]
  );
  return result.affectedRows;
}
