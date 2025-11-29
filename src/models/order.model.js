// src/models/order.model.js
import pool from '../config/db.js';

// 트랜잭션용 커넥션 가져오기
export async function getConnection() {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  return conn;
}

// 주문 헤더 생성
export async function insertOrder(conn, {
  userId,
  totalOriginalPrice,
  totalDiscountedPrice,
  totalEarnedPoint
}) {
  const [result] = await conn.query(
    `INSERT INTO orders
       (user_id, total_original_price, total_discounted_price, total_earned_point)
     VALUES (?, ?, ?, ?)`,
    [userId, totalOriginalPrice, totalDiscountedPrice, totalEarnedPoint]
  );
  return result.insertId;
}

// 주문 상세 생성
export async function insertOrderItem(conn, {
  orderId,
  productId,
  quantity,
  unitOriginalPrice,
  unitDiscountedPrice,
  earnedPoint
}) {
  await conn.query(
    `INSERT INTO order_items
       (order_id, product_id, quantity, unit_original_price,
        unit_discounted_price, earned_point)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderId, productId, quantity, unitOriginalPrice, unitDiscountedPrice, earnedPoint]
  );
}

// 상품 재고 감소
export async function decreaseProductStock(conn, productId, quantity) {
  await conn.query(
    `UPDATE products
     SET stock = stock - ?
     WHERE product_id = ? AND stock >= ?`,
    [quantity, productId, quantity]
  );
}

// 유저 총사용금액/포인트 업데이트
export async function updateUserAfterOrder(conn, userId, plusSpent, plusPoint, newGradeCode) {
  await conn.query(
    `UPDATE users
     SET total_spent = total_spent + ?,
         point       = point + ?,
         grade_code  = ?
     WHERE user_id = ?`,
    [plusSpent, plusPoint, newGradeCode, userId]
  );
}

// 주문 단건 조회(완료 페이지용)
export async function findOrderById(orderId, userId) {
  const [rows] = await pool.query(
    `SELECT *
     FROM orders
     WHERE order_id = ? AND user_id = ?`,
    [orderId, userId]
  );
  return rows[0] || null;
}
