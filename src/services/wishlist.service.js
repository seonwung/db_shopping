// src/services/wishlist.service.js
import { getProductById } from '../models/product.model.js';
import {
  findFavorite,
  insertFavorite,
  deleteFavorite,
  deleteFavoriteById
} from '../models/wishlist.model.js';

// 찜 추가 (이미 있으면 그냥 무시)
export async function addFavorite(userId, productId) {
  const product = await getProductById(productId);
  if (!product) {
    const err = new Error('상품을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  const existing = await findFavorite(userId, productId);
  if (existing) {
    // 이미 찜한 상품이면 조용히 넘어감 (에러 안 던짐)
    return;
  }

  await insertFavorite(userId, productId);
}

// 찜 해제 (productId 기반)
export async function removeFavorite(userId, productId) {
  await deleteFavorite(userId, productId);
}

// 찜 해제 (favoriteId 기반 – 마이페이지에서 쓸 수도 있음)
export async function removeFavoriteById(userId, favoriteId) {
  await deleteFavoriteById(userId, favoriteId);
}
