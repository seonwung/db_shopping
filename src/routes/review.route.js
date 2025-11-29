import { Router } from 'express';
import { requireLogin } from '../middlewares/auth.middleware.js';

const router = Router;

// TODO: 리뷰 작성/수정/삭제
// router.post('/:productId', requireLogin, ...)

export default router;