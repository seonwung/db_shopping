
export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

export function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
}

// 매 요청마다 EJS에 currentUser 제공
export function attachUserToLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}