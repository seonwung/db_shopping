// src/services/order.service.js
import { getCartItemsByUserId } from '../models/cart.model.js';
import { getProductById } from '../models/product.model.js';
import {
  getConnection,
  insertOrder,
  insertOrderItem,
  decreaseProductStock,
  updateUserAfterOrder,
  findOrderById
} from '../models/order.model.js';
import { calcDiscountedUnitPrice } from '../utils/price.util.js';
import { calcEarnPoint } from '../utils/point.util.js';
import { getGradeByTotalSpent } from '../utils/grade.util.js';
import pool from '../config/db.js';
import { clearCartByUserId } from '../models/cart.model.js';

// 유저 + 등급 정보 가져오기
async function getUserWithGrade(userId) {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.total_spent, u.grade_code,
            g.discount_rate, g.earn_rate
     FROM users u
     JOIN user_grades g ON u.grade_code = g.grade_code
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

// 장바구니 기반 주문
export async function createOrderFromCart(userId) {
  const user = await getUserWithGrade(userId);
  if (!user) {
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.status = 401;
    throw err;
  }

  const cartItems = await getCartItemsByUserId(userId);
  if (cartItems.length === 0) {
    const err = new Error('장바구니에 상품이 없습니다.');
    err.status = 400;
    throw err;
  }

  let totalOriginal = 0;
  let totalDiscounted = 0;

  const lines = cartItems.map(item => {
    const unitOriginal = item.price;
    const unitDiscounted = calcDiscountedUnitPrice(item.price, item.discount_percentage);
    const lineOriginal = unitOriginal * item.quantity;
    const lineDiscounted = unitDiscounted * item.quantity;

    totalOriginal += lineOriginal;
    totalDiscounted += lineDiscounted;

    return {
      productId: item.product_id,
      quantity: item.quantity,
      unitOriginal,
      unitDiscounted
    };
  });

  // 등급 적립률 기준 포인트 계산
  const earnedPoint = calcEarnPoint(totalDiscounted, user.earn_rate);

  const conn = await getConnection();
  try {
    const orderId = await insertOrder(conn, {
      userId,
      totalOriginalPrice: totalOriginal,
      totalDiscountedPrice: totalDiscounted,
      totalEarnedPoint: earnedPoint
    });

    // 주문 상세 + 재고 감소
    for (const line of lines) {
      await insertOrderItem(conn, {
        orderId,
        productId: line.productId,
        quantity: line.quantity,
        unitOriginalPrice: line.unitOriginal,
        unitDiscountedPrice: line.unitDiscounted,
        earnedPoint: 0 // 개별 라인 포인트는 0으로 두고 전체에만 반영
      });

      await decreaseProductStock(conn, line.productId, line.quantity);
    }

    // 총 사용 금액 기반으로 새 등급 계산
    const newTotalSpent = user.total_spent + totalDiscounted;
    const newGrade = await getGradeByTotalSpent(newTotalSpent);
    const newGradeCode = newGrade ? newGrade.grade_code : user.grade_code;

    await updateUserAfterOrder(
      conn,
      userId,
      totalDiscounted,
      earnedPoint,
      newGradeCode
    );

    // 장바구니 비우기
    await clearCartByUserId(userId);

    await conn.commit();

    return {
      orderId,
      totalOriginal,
      totalDiscounted,
      earnedPoint
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 바로구매용 단일 상품 주문
export async function createQuickOrder(userId, productId, quantity = 1) {
  const user = await getUserWithGrade(userId);
  if (!user) {
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.status = 401;
    throw err;
  }

  const product = await getProductById(productId);
  if (!product) {
    const err = new Error('상품을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  if (product.stock <= 0) {
    const err = new Error('품절된 상품입니다.');
    err.status = 400;
    throw err;
  }

  const q = Math.min(Number(quantity) || 1, product.stock);

  const unitOriginal = product.price;
  const unitDiscounted = calcDiscountedUnitPrice(product.price, product.discount_percentage);

  const totalOriginal = unitOriginal * q;
  const totalDiscounted = unitDiscounted * q;
  const earnedPoint = calcEarnPoint(totalDiscounted, user.earn_rate);

  const conn = await getConnection();
  try {
    const orderId = await insertOrder(conn, {
      userId,
      totalOriginalPrice: totalOriginal,
      totalDiscountedPrice: totalDiscounted,
      totalEarnedPoint: earnedPoint
    });

    await insertOrderItem(conn, {
      orderId,
      productId,
      quantity: q,
      unitOriginalPrice: unitOriginal,
      unitDiscountedPrice: unitDiscounted,
      earnedPoint: 0
    });

    const newTotalSpent = user.total_spent + totalDiscounted;
    const newGrade = await getGradeByTotalSpent(newTotalSpent);
    const newGradeCode = newGrade ? newGrade.grade_code : user.grade_code;

    await decreaseProductStock(conn, productId, q);
    await updateUserAfterOrder(conn, userId, totalDiscounted, earnedPoint, newGradeCode);

    await conn.commit();

    return {
      orderId,
      totalOriginal,
      totalDiscounted,
      earnedPoint
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getOrderSummary(orderId, userId) {
  const order = await findOrderById(orderId, userId);
  if (!order) {
    const err = new Error('주문을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  return order;
}
