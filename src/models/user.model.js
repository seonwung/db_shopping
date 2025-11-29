import pool from '../config/db.js';

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
    [email]
  );
  return rows[0] || null;
}

export async function findById(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  );
  return rows[0] || null;
}

export async function createUser({ email, password_hash, user_name }) {
  const [result] = await pool.query(
    `INSERT INTO users (email, password, user_name, grade_code, total_spent, is_admin)
     VALUES (?, ?, ?, 'BRONZE', 0, 0)`,
    [email, password_hash, user_name]
  );
  return result.insertId;
}

export async function updateProfile(userId, { user_name, phone, birthday }) {
  await pool.query(
    `UPDATE users
     SET user_name = ?, phone = ?, birthday = ?
     WHERE user_id = ?`,
    [user_name, phone, birthday, userId]
  );
} 



// 마이페이지용: 유저 프로필 + 등급 정보
export async function getUserProfileById(userId) {
  const [rows] = await pool.query(
    `SELECT
       u.user_id,
       u.email,
       u.user_name,
       u.is_admin,
       u.grade_code,
       u.point,
       u.total_spent,
       u.created_at,
       g.name          AS grade_name,
       g.discount_rate,
       g.earn_rate
     FROM users u
     JOIN user_grades g ON u.grade_code = g.grade_code
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

// 마이페이지용: 최근 주문 10건
export async function getUserOrdersByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT
       o.order_id,
       o.order_status,
       o.total_original_price,
       o.total_discounted_price,
       o.total_earned_point,
       o.created_at,
       COUNT(oi.order_item_id) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON o.order_id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.order_id
     ORDER BY o.created_at DESC
     LIMIT 10`,
    [userId]
  );
  return rows;
}

// 마이페이지용: 찜 개수
export async function getUserFavoritesSummaryByUserId(userId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS favorites_count
     FROM favorites
     WHERE user_id = ?`,
    [userId]
  );
  return row;
}

// 찜 목록 상세 (마이페이지 > 찜 탭)
export async function getUserFavoritesByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT
       f.favorite_id,
       p.product_id,
       p.name,
       p.price_krw          AS price,
       p.discount_percentage,
       p.thumbnail_url,
       b.name               AS brand_name,
       f.created_at
     FROM favorites f
     JOIN products p ON f.product_id = p.product_id
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}
