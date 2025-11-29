
import {
  addItemToCart,
  getCartWithSummary,
  updateCartItem,
  removeCartItem
} from '../services/cart.service.js';

export async function showCart(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { items, totalOriginal, totalDiscounted } = await getCartWithSummary(userId);

    res.render('cart/index', {
      title: '장바구니',
      items,
      totalOriginal,
      totalDiscounted
    });
  } catch (err) {
    next(err);
  }
}

export async function handleAddToCart(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { productId, quantity } = req.body;

    await addItemToCart(userId, productId, quantity);
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCart(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { cartItemId, quantity } = req.body;
    await updateCartItem(userId, cartItemId, quantity);
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteCartItem(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const { cartItemId } = req.body;
    await removeCartItem(userId, cartItemId);
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
}
