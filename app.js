// app.js
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import expressLayouts from 'express-ejs-layouts';

import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';
import { attachUserToLocals } from './src/middlewares/auth.middleware.js';

// 라우터
import authRoutes from './src/routes/auth.route.js';
import productRoutes from './src/routes/products.route.js';
import cartRoutes from './src/routes/cart.route.js';
import orderRoutes from './src/routes/order.route.js';
import wishlistRoutes from './src/routes/wishlist.route.js';
import reviewRoutes from './src/routes/review.route.js';
import adminRoutes from './src/routes/admin.route.js';
import userRoutes from './src/routes/user.route.js';

// 홈화면용 컨트롤러
import { renderHome } from './src/controllers/products.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== EJS + Layout 설정 =====
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout/mainLayout');

// ===== 공통 미들웨어 =====
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 정적 파일
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
// 세션
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sunwoong-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // 1h
    }
  })
);

// EJS에서 currentUser 사용
app.use(attachUserToLocals);

// ===== 라우트 매핑 =====

// 홈
app.get('/', renderHome);

// 기능별 라우터
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/review', reviewRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// 404 / 에러
app.use(notFoundHandler);
app.use(errorHandler);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`선웅이 옷가게 서버 실행: http://localhost:${PORT}`);
});
