export function notFoundHandler(req, res, next) {
  res.status(404).send('404 Not Found');
}

export function errorHandler(err, req, res, next) {
  console.error(' ORIGINAL ERROR:', err);  // 진짜 에러 전체 로그

  const status = err.status || 500;
  const message = err.message || '서버 에러가 발생했습니다.';

  // 일단 개발 중이니까 그냥 텍스트로 바로 보내자
  res.status(status).send(message);
}