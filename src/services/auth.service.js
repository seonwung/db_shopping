
import bcrypt from 'bcryptjs';
import { findByEmail, createUser } from '../models/user.model.js';

export async function register({ email, password, user_name }) {
  const existing = await findByEmail(email);
  if (existing) {
    const err = new Error('이미 가입된 이메일입니다.');
    err.status = 400;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userId = await createUser({ email, password_hash, user_name });

  return { user_id: userId, email, user_name, is_admin: 0 };
}

export async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    const err = new Error('이메일 또는 비밀번호를 다시 확인해주세요.');
    err.status = 400;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('이메일 또는 비밀번호를 다시 확인해주세요.');
    err.status = 400;
    throw err;
  }

  return {
    user_id: user.user_id,
    email: user.email,
    user_name: user.user_name,
    is_admin: user.is_admin
  };
}
