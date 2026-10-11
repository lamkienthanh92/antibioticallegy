export const pc = (x, d = 1) => (x * 100).toFixed(d) + '%'
export const ciT = p => `${pc(p.p)} (${pc(p.lo)}–${pc(p.hi)})`
export const ciS = p => `${pc(p.lo)}–${pc(p.hi)}`
export const frac = p => `${p.k}/${p.n}`
export const f2 = x => x.toFixed(2)
export const fmt = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
export const pv = p => (p < 0.001 ? '<.001' : p > 0.995 ? '>.99' : p.toFixed(2).replace(/^0/, ''))
export const KEYS = ['eaaci', 'pf', 't111', 'timing', 'score']
export const NAMES = { eaaci: 'EAACI/ENDA', pf: 'PEN-FAST (<3 points)', t111: '1-1-1 criterion', timing: 'Timing rule', score: 'Data-derived score (≤2 points)' }
export const SHORT = { eaaci: 'EAACI/ENDA', pf: 'PEN-FAST', t111: '1-1-1', timing: 'Timing rule', score: 'Derived score' }
export const COL = { eaaci: 'var(--t1)', pf: 'var(--t2)', t111: 'var(--t3)', timing: 'var(--t4)', score: 'var(--t5)' }
export const LABEL = { low: 'Low', mid: 'Intermediate', high: 'High', contra: 'Challenge contraindicated', na: 'Not applicable' }
