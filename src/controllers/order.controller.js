// src/controllers/order.controller.js
import {
  createOrderFromCart,
  createQuickOrder,
  getOrderSummary
} from '../services/order.service.js';

export async function handleOrderFromCart(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const result = await createOrderFromCart(userId);

    res.redirect(`/order/complete/${result.orderId}`);
  } catch (err) {
    next(err);
  }
}

export async function handleQuickOrder(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { productId, quantity } = req.body;
    const result = await createQuickOrder(userId, productId, quantity);
    res.redirect(`/order/complete/${result.orderId}`);
  } catch (err) {
    next(err);
  }
}

export async function showOrderComplete(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { orderId } = req.params;
    const order = await getOrderSummary(orderId, userId);

    res.render('order/complete', {
      title: '주문 완료',
      order
    });
  } catch (err) {
    next(err);
  }
}
