
import pool from '../config/db.js';


export async function getGradeByTotalSpent(totalSpent) {
  const [rows] = await pool.query(
    `SELECT grade_code, name, min_total_spent, discount_rate, earn_rate
     FROM user_grades
     WHERE min_total_spent <= ?
     ORDER BY min_total_spent DESC
     LIMIT 1`,
    [totalSpent]
  );
  return rows[0] || null;
}
