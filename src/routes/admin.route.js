import { Router } from 'express';
import { requireAdmin } from '../middlewares/admin.middleware.js';

const router = Router();

// TODO: 관리자 상품/유저 관리 페이지
router.get('/', requireAdmin, (req, res) => {
  res.send('관리자 대시보드 (TODO)');
});

export default router;