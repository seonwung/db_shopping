
import { Router } from 'express';
import { requireLogin } from '../middlewares/auth.middleware.js';
import {
  renderMyPage,
  renderMyOrders,
  renderMyFavorites
} from '../controllers/user.controller.js';

const router = Router();

// /user/mypage
router.get('/mypage', requireLogin, renderMyPage);

// /user/orders
router.get('/orders', requireLogin, renderMyOrders);

// /user/favorites
router.get('/favorites', requireLogin, renderMyFavorites);

export default router;
