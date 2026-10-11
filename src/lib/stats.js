function lgam(z) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]
  let y = z, x = z, t = x + 5.5
  t -= (x + 0.5) * Math.log(t)
  let s = 1.000000000190015
  for (let j = 0; j < 6; j++) s += c[j] / ++y
  return -t + Math.log((2.5066282746310005 * s) / x)
}
const lchoose = (n, k) => lgam(n + 1) - lgam(k + 1) - lgam(n - k + 1)
function binCdf(k, n, p) {
  if (p <= 0) return 1
  if (p >= 1) return k >= n ? 1 : 0
  let s = 0
  for (let i = 0; i <= k; i++) s += Math.exp(lchoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p))
  return Math.min(1, s)
}
export function cpUpper(k, n) {
  if (k >= n) return 1
  let lo = k / n, hi = 1
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (binCdf(k, n, mid) > 0.025) lo = mid; else hi = mid }
  return (lo + hi) / 2
}
export function cpLower(k, n) {
  if (k <= 0) return 0
  let lo = 0, hi = k / n
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (1 - binCdf(k - 1, n, mid) < 0.025) lo = mid; else hi = mid }
  return (lo + hi) / 2
}
export const propR = (k, n) => ({ k, n, p: k / n, lo: cpLower(k, n), hi: cpUpper(k, n) })
export function needLow(k, tgt) {
  for (let n = Math.max(k, 1); n <= 3000; n++) if (cpUpper(k, n) <= tgt) return n
  return null
}
export const npv = (se, sp, p) => { const den = sp * (1 - p) + (1 - se) * p; return den > 0 ? (sp * (1 - p)) / den : 1 }
