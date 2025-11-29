
export function calcEarnPoint(amount, earnRate) {
  const a = Number(amount) || 0;
  const r = Number(earnRate) || 0;
  return Math.floor(a * r);
}
