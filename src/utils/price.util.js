
// 개별 상품 할인 적용 가격 계산
export function calcDiscountedUnitPrice(price, discountPercentage) {
  const p = Number(price) || 0;
  const d = Number(discountPercentage) || 0;

  if (d <= 0) return p;

  const discounted = Math.floor(p * (1 - d / 100));
  return discounted < 0 ? 0 : discounted;
}
