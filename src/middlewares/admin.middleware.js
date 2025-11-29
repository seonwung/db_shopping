export function requireAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).send('관리자 권한이 필요합니다.');
  }
  next();
}