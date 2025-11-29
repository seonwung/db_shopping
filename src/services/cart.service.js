// src/services/cart.service.js
import {
  getCartItemsByUserId,
  findCartItem,
  insertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCartByUserId
} from '../models/cart.model.js';
import { getProductById } from '../models/product.model.js';
import { calcDiscountedUnitPrice } from '../utils/price.util.js';

// 장바구니에 상품 추가
export async function addItemToCart(userId, productId, quantity = 1) {
  const product = await getProductById(productId);
  if (!product) {
    const err = new Error('존재하지 않는 상품입니다.');
    err.status = 404;
    throw err;
  }

  if (product.stock <= 0) {
    const err = new Error('품절된 상품입니다.');
    err.status = 400;
    throw err;
  }

  const q = Number(quantity) || 1;
  const finalQty = Math.min(q, product.stock);

  const existing = await findCartItem(userId, productId);
  if (existing) {
    await updateCartItemQuantity(existing.cart_item_id, userId, existing.quantity + finalQty);
  } else {
    await insertCartItem(userId, productId, finalQty);
  }
}

// 장바구니 목록 + 합계 계산
export async function getCartWithSummary(userId) {
  const items = await getCartItemsByUserId(userId);

  let totalOriginal = 0;
  let totalDiscounted = 0;

  const mapped = items.map(item => {
    const unitOriginal = item.price;
    const unitDiscounted = calcDiscountedUnitPrice(item.price, item.discount_percentage);
    const lineOriginal = unitOriginal * item.quantity;
    const lineDiscounted = unitDiscounted * item.quantity;

    totalOriginal += lineOriginal;
    totalDiscounted += lineDiscounted;

    return {
      ...item,
      unitOriginal,
      unitDiscounted,
      lineOriginal,
      lineDiscounted
    };
  });

  return {
    items: mapped,
    totalOriginal,
    totalDiscounted
  };
}

export async function updateCartItem(userId, cartItemId, quantity) {
  const q = Number(quantity) || 1;
  if (q <= 0) {
    await deleteCartItem(cartItemId, userId);
    return;
  }
  await updateCartItemQuantity(cartItemId, userId, q);
}

export async function removeCartItem(userId, cartItemId) {
  await deleteCartItem(cartItemId, userId);
}

export async function clearCart(userId) {
  await clearCartByUserId(userId);
}
