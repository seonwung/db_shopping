
import {
  getMyPageData,
  getMyOrders,
  getMyFavorites
} from '../services/user.service.js';

export async function renderMyPage(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { profile, orders, favoritesCount } = await getMyPageData(userId);

    res.render('user/mypage', {
      title: '마이페이지',
      profile,
      orders,
      favoritesCount
    });
  } catch (err) {
    next(err);
  }
}

export async function renderMyOrders(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const orders = await getMyOrders(userId);

    res.render('user/orders', {
      title: '주문 내역',
      orders
    });
  } catch (err) {
    next(err);
  }
}

export async function renderMyFavorites(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const favorites = await getMyFavorites(userId);

    res.render('user/favorites', {
      title: '찜한 상품',
      favorites
    });
  } catch (err) {
    next(err);
  }
}
