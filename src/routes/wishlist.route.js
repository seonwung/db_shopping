// src/routes/wishlist.route.js
import { Router } from 'express';
import { requireLogin } from '../middlewares/auth.middleware.js';
import {
  handleAddFavorite,
  handleRemoveFavorite,
  handleRemoveFavoriteById
} from '../controllers/wishlist.controller.js';

const router = Router();

// 찜 추가
router.post('/add', requireLogin, handleAddFavorite);

// 찜 해제 (productId 기준 – 필요하면 사용)
router.post('/remove', requireLogin, handleRemoveFavorite);

// 찜 해제 (favoriteId 기준 – 마이페이지에서 사용)
router.post('/remove-by-id', requireLogin, handleRemoveFavoriteById);

export default router;
