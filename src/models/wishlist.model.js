// src/models/wishlist.model.js
import pool from '../config/db.js';

// 해당 유저가 해당 상품을 이미 찜했는지 조회
export async function findFavorite(userId, productId) {
  const [rows] = await pool.query(
    `SELECT *
     FROM favorites
     WHERE user_id = ? AND product_id = ?`,
    [userId, productId]
  );
  return rows[0] || null;
}

// 찜 추가
export async function insertFavorite(userId, productId) {
  const [result] = await pool.query(
    `INSERT INTO favorites (user_id, product_id)
     VALUES (?, ?)`,
    [userId, productId]
  );
  return result.insertId;
}

// 찜 삭제 (userId + productId 기준)
export async function deleteFavorite(userId, productId) {
  const [result] = await pool.query(
    `DELETE FROM favorites
     WHERE user_id = ? AND product_id = ?`,
    [userId, productId]
  );
  return result.affectedRows;
}

// 찜 삭제 (favorite_id 기준 – 마이페이지에서 사용할 수도 있음)
export async function deleteFavoriteById(userId, favoriteId) {
  const [result] = await pool.query(
    `DELETE FROM favorites
     WHERE favorite_id = ? AND user_id = ?`,
    [favoriteId, userId]
  );
  return result.affectedRows;
}
