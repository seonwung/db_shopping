
import { Router } from 'express';
import { requireLogin } from '../middlewares/auth.middleware.js';
import {
  showCart,
  handleAddToCart,
  handleUpdateCart,
  handleDeleteCartItem
} from '../controllers/cart.controller.js';

const router = Router();

router.get('/', requireLogin, showCart);
router.post('/add', requireLogin, handleAddToCart);
router.post('/update', requireLogin, handleUpdateCart);
router.post('/delete', requireLogin, handleDeleteCartItem);

export default router;
