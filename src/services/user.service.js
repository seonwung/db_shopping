
import {
  getUserProfileById,
  getUserOrdersByUserId,
  getUserFavoritesSummaryByUserId,
  getUserFavoritesByUserId
} from '../models/user.model.js';

export async function getMyPageData(userId) {
  const [profile, orders, favoritesSummary] = await Promise.all([
    getUserProfileById(userId),
    getUserOrdersByUserId(userId),
    getUserFavoritesSummaryByUserId(userId)
  ]);

  if (!profile) {
    const err = new Error('사용자 정보를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  return {
    profile,
    orders,
    favoritesCount: favoritesSummary?.favorites_count || 0
  };
}

export async function getMyOrders(userId) {
  const orders = await getUserOrdersByUserId(userId);
  return orders;
}

export async function getMyFavorites(userId) {
  const favorites = await getUserFavoritesByUserId(userId);
  return favorites;
}
