// src/services/product.service.js
import {
  getBestProducts,
  getNewProducts,
  getProductList,
  getProductById
} from '../models/product.model.js';

export async function getHomeData() {
  const [best, newest] = await Promise.all([
    getBestProducts(8),
    getNewProducts(12)
  ]);
  return { best, newest };
}

export async function listProducts({ page, limit, groupCode, keyword }) {
  return await getProductList({ page, limit, groupCode, keyword });
}

export async function getProductDetail(productId) {
  const product = await getProductById(productId);
  if (!product) {
    const err = new Error('상품을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  return product;
}
