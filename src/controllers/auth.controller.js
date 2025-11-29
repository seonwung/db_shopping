
import { register, login } from '../services/auth.service.js';

export function showRegisterForm(req, res) {
  res.render('auth/register', {
    title: '회원가입',
    error: null,
    form: {}
  });
}

export async function handleRegister(req, res, next) {
  try {
    const { email, password, password_confirm, user_name } = req.body;

    if (!email || !password || !password_confirm || !user_name) {
      return res.render('auth/register', {
        title: '회원가입',
        error: '모든 필드를 입력해주세요.',
        form: { email, user_name }
      });
    }

    if (password !== password_confirm) {
      return res.render('auth/register', {
        title: '회원가입',
        error: '비밀번호가 일치하지 않습니다.',
        form: { email, user_name }
      });
    }

    const user = await register({ email, password, user_name });
    req.session.user = user;

    res.redirect('/');
  } catch (err) {
    if (err.status === 400) {
      return res.render('auth/register', {
        title: '회원가입',
        error: err.message,
        form: { email: req.body.email, user_name: req.body.user_name }
      });
    }
    next(err);
  }
}

export function showLoginForm(req, res) {
  res.render('auth/login', {
    title: '로그인',
    error: null,
    form: {}
  });
}

export async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('auth/login', {
        title: '로그인',
        error: '이메일과 비밀번호를 입력해주세요.',
        form: { email }
      });
    }

    const user = await login({ email, password });
    req.session.user = user;

    res.redirect('/');
  } catch (err) {
    if (err.status === 400) {
      return res.render('auth/login', {
        title: '로그인',
        error: err.message,
        form: { email: req.body.email }
      });
    }
    next(err);
  }
}

export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}
