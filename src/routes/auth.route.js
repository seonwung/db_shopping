import { Router } from 'express';
import { requireGuest, requireLogin } from '../middlewares/auth.middleware.js';
import {
  showRegisterForm,
  handleRegister,
  showLoginForm,
  handleLogin,
  handleLogout
} from '../controllers/auth.controller.js';

const router = Router();

// 회원가입
router.get('/register', requireGuest, showRegisterForm);
router.post('/register', requireGuest, handleRegister);

// 로그인
router.get('/login', requireGuest, showLoginForm);
router.post('/login', requireGuest, handleLogin);

// 로그아웃
router.post('/logout', requireLogin, handleLogout);
// or GET으로 하고 싶으면 아래처럼:
// router.get('/logout', requireLogin, handleLogout);

export default router;