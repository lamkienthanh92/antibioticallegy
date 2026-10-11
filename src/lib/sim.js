import D from '../data/cohort.json'
import { KEYS, NAMES } from './format'

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
export function runSim(P) {
  const R = rng(20261011)
  const normal = () => { let u = 0, v = 0; while (u === 0) u = R(); while (v === 0) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
  const gamma = a => { if (a < 1) return gamma(a + 1) * Math.pow(R(), 1 / a); const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { let x, v; do { x = normal(); v = 1 + c * x } while (v <= 0); v = v * v * v; const u = R(); if (u < 1 - 0.0331 * x * x * x * x) return d * v; if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v } }
  const betaS = (a, b) => { const x = gamma(a), y = gamma(b); return x / (x + y) }
  const jeff = (k, n) => () => betaS(k + 0.5, n - k + 0.5)
  const fromMean = (m, n) => () => betaS(m * n, (1 - m) * n)
  const STRATS = [{ n: 'Skin test all', type: 'all-skin' }, { n: 'Direct challenge all', type: 'all-direct' }].concat(KEYS.map(k => {
    const m = D.base[k]
    const o = { n: NAMES[k].replace(' (<3 points)', '').replace(' (≤2 points)', ''), se: jeff(m.se.k, m.se.n), sp: jeff(m.sp.k, m.sp.n) }
    if (m.origin === 'der') { o.der = true; const se = k === 'timing' ? D.loo.rule_se : D.loo.score_se, sp = k === 'timing' ? D.loo.rule_sp : D.loo.score_sp; o.secv = jeff(se[0], se[1]); o.spcv = jeff(sp[0], sp[1]) }
    return o
  }))
  const Dr = 2000, N = 1000
  const prev = P.prev / 100, stse = P.stse / 100, sevm = P.sev / 100, altm = P.alt / 100, red = P.red / 100
  const c = [P.c1, P.c2, P.c3, P.c4, P.c5]
  const stSe = fromMean(stse, 43.7), stSp = () => betaS(270, 9), sev = fromMean(sevm, 316), alt = fromMean(Math.max(altm, 0.0001), 37)
  const al = N * prev, na = N - al
  const pct = a => { a.sort((x, y) => x - y); const n = a.length; let s = 0; for (let i = 0; i < n; i++) s += a[i]; return { m: s / n, lo: a[Math.floor(n * 0.025)], hi: a[Math.floor(n * 0.975)] } }
  return STRATS.map(st => {
    const acc = { skin: [], dpt: [], react: [], severe: [], falselab: [], delab: [], fq: [], cost: [] }
    for (let i = 0; i < Dr; i++) {
      let se, sp
      if (st.type === 'all-skin') { se = 1; sp = 0 } else if (st.type === 'all-direct') { se = 0; sp = 1 }
      else if (st.der && P.cv) { se = st.secv(); sp = st.spcv() } else { se = st.se(); sp = st.sp() }
      const a = stSe(), b = stSp(), s = sev(), pa = altm > 0 ? alt() : 0
      const alLow = al * (1 - se), alHi = al * se, naLow = na * sp, naHi = na * (1 - sp)
      const skin = alHi + naHi, react = alLow + alHi * (1 - a), fl = naHi * (1 - b), dpt = alLow + naLow + alHi * (1 - a) + naHi * b, sv = react * s
      const delab = naLow + naHi * b, fq = skin * pa + (alLow + naLow) * pa * (1 - red)
      acc.skin.push(skin); acc.dpt.push(dpt); acc.react.push(react); acc.severe.push(sv); acc.falselab.push(fl); acc.delab.push(delab); acc.fq.push(fq)
      acc.cost.push(skin * c[0] + dpt * c[1] + sv * c[2] + fl * c[3] + fq * c[4])
    }
    const o = { n: st.n }; Object.keys(acc).forEach(k => { o[k] = pct(acc[k]) }); return o
  })
}
export function det(P) {
  const al = 1000 * P.p, na = 1000 - al
  const A = { skin: 1000, react: al * (1 - P.a), fl: na * (1 - P.b) }
  const alHi = al * P.se, alLow = al - alHi, naLow = na * P.sp, naHi = na - naLow
  const T = { skin: alHi + naHi, react: alLow + alHi * (1 - P.a), fl: naHi * (1 - P.b) }
  return { react: T.react - A.react, skin: A.skin - T.skin, label: A.fl - T.fl }
}
export const METRIC = { skin: ['Skin tests', 0], dpt: ['Challenges', 0], react: ['Challenge reactions', 0], severe: ['Severe reactions', 2], falselab: ['False labels from skin tests', 1], delab: ['Correctly delabeled', 0], fq: ['Fluoroquinolone exposure', 0], cost: ['Relative cost', 0] }
