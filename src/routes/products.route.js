// src/routes/products.route.js
import { Router } from 'express';
import {
  showProductList,
  showProductDetail
} from '../controllers/products.controller.js';

const router = Router();

// /products?group=TOP&keyword=후드
router.get('/', showProductList);

// /products/123
router.get('/:id', showProductDetail);

export default router;
