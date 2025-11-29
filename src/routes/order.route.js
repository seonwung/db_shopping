// src/routes/order.route.js
import { Router } from 'express';
import { requireLogin } from '../middlewares/auth.middleware.js';
import {
  handleOrderFromCart,
  handleQuickOrder,
  showOrderComplete
} from '../controllers/order.controller.js';

const router = Router();

router.post('/from-cart', requireLogin, handleOrderFromCart);
router.post('/quick', requireLogin, handleQuickOrder);
router.get('/complete/:orderId', requireLogin, showOrderComplete);

export default router;
