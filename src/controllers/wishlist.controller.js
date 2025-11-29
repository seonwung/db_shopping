
import {
  addFavorite,
  removeFavorite,
  removeFavoriteById
} from '../services/wishlist.service.js';

// 디테일 페이지 / 목록에서 "찜하기" 눌렀을 때
export async function handleAddFavorite(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { productId } = req.body;

    await addFavorite(userId, productId);

    // 원래 보고 있던 페이지로 돌아가기
    const backUrl = req.get('Referer') || `/products/${productId}`;
    res.redirect(backUrl);
  } catch (err) {
    next(err);
  }
}

// productId 기반 찜 해제 (필요시)
export async function handleRemoveFavorite(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { productId } = req.body;

    await removeFavorite(userId, productId);

    const backUrl = req.get('Referer') || '/user/favorites';
    res.redirect(backUrl);
  } catch (err) {
    next(err);
  }
}

// favoriteId 기반 찜 해제 (마이페이지 찜 목록에서 쓸 버전)
export async function handleRemoveFavoriteById(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { favoriteId } = req.body;

    await removeFavoriteById(userId, favoriteId);

    const backUrl = req.get('Referer') || '/user/favorites';
    res.redirect(backUrl);
  } catch (err) {
    next(err);
  }
}
