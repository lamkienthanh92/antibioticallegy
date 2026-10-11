import D from '../data/cohort.json'
import { KEYS, NAMES, SHORT, COL, fmt, pc, f2 } from '../lib/format'
import { cpUpper, npv } from '../lib/stats'
import { det } from '../lib/sim'

export function Legend({ items, note }) {
  return (
    <>
      <div className="legend">{items.map((it, i) => <span key={i}><i style={{ borderColor: it.color, borderTopStyle: it.dash ? 'dashed' : 'solid', opacity: it.op }} />{it.label}</span>)}</div>
      {note && <p className="meta" style={{ margin: '6px 4px 0' }}>{note}</p>}
    </>
  )
}

export function DotCI({ rows, W = 640, rh = 26, L = 220, R = 92, min = 0, max = 1, step = 0.25, fmt: f, axis = 'Proportion (95% CI)', zero = false, aria = 'Estimates with 95% confidence intervals' }) {
  const Tp = 16, B = 34, H = Tp + rows.length * rh + B
  const x = v => L + ((v - min) / (max - min)) * (W - L - R)
  const ticks = []; for (let v = min; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(6))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
      {ticks.map(v => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={Tp - 4} y2={H - B + 2} stroke="currentColor" opacity={zero && Math.abs(v) < 1e-9 ? 0.6 : 0.12} />
          <text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle">{f ? f(v) : Math.round(v * 100) + '%'}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = Tp + i * rh + rh / 2, col = r.col || 'var(--bar)'
        return (
          <g key={i}>
            <text x={L - 8} y={y + 4} fontSize="11.5" textAnchor="end">{r.label}</text>
            <line x1={x(r.lo)} x2={x(r.hi)} y1={y} y2={y} stroke={col} strokeWidth="2.2" />
            <circle cx={x(r.p)} cy={y} r="5" fill={col} />
            {r.sub && <text x={x(r.hi) + 8} y={y + 4} fontSize="10.5" opacity=".85">{r.sub}</text>}
          </g>
        )
      })}
      <text x={(L + W - R) / 2} y={H - 4} fontSize="11.5" textAnchor="middle">{axis}</text>
    </svg>
  )
}

export function PathBars() {
  const F = D.funnel, W = 640, rh = 44, L = 140, R = 190, Tp = 14, H = Tp + F.cats.length * rh + 34, u = (W - L - R) / 19
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Children by EAACI/ENDA category, split by confirmed allergy">
        {F.cats.map((c, i) => {
          const y = Tp + i * rh, nA = c.allergic, nB = c.n - c.allergic
          return (
            <g key={c.cat}>
              <text x={L - 10} y={y + 22} fontSize="12" textAnchor="end">{c.cat} risk</text>
              <rect x={L} y={y + 8} width={nB * u} height="22" fill="var(--clear)" opacity=".75" />
              <rect x={L + nB * u} y={y + 8} width={nA * u} height="22" fill="var(--red)" />
              <text x={L + c.n * u + 8} y={y + 17} fontSize="11.5">{nA} of {c.n} allergic</text>
              <text x={L + c.n * u + 8} y={y + 32} fontSize="10.5" opacity=".75">{c.skin} skin tested · {c.direct} direct challenge</text>
            </g>
          )
        })}
      </svg>
      <Legend items={[{ color: 'var(--clear)', label: 'delabeled' }, { color: 'var(--red)', label: 'confirmed allergy' }]} note="Skin testing preceded challenge in all 17 injectable cephalosporin courses and in 3 of 21 oral courses." />
    </>
  )
}

const DOT_LABELS = ['Reaction after the first dose', 'Rapid onset', 'Previous exposure to the culprit', 'Symptoms resolved within 1 day', 'Symptoms lasting >3 days', 'Treated with medication', 'Any personal atopy', 'Urticaria', 'Angioedema', 'Age ≥60 months']
export function PairDots() {
  const rows = DOT_LABELS.map(l => D.T1.find(r => r.label === l))
  const W = 640, rh = 26, L = 230, R = 20, Tp = 18, B = 40, H = Tp + rows.length * rh + B, x = v => L + v * (W - L - R)
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Share of children with each feature, allergic versus delabeled">
        {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={Tp - 4} y2={H - B + 2} stroke="currentColor" opacity=".12" /><text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle">{Math.round(v * 100)}%</text></g>)}
        {rows.map((r, i) => {
          const y = Tp + i * rh + rh / 2, pa = r.a / 6, pb = r.b / 32
          return <g key={i}><text x={L - 8} y={y + 4} fontSize="11.5" textAnchor="end">{r.label}</text><line x1={x(pa)} x2={x(pb)} y1={y} y2={y} stroke="currentColor" opacity=".35" strokeWidth="2" /><circle cx={x(pb)} cy={y} r="5" fill="var(--clear)" /><circle cx={x(pa)} cy={y} r="5.5" fill="var(--red)" /></g>
        })}
        <text x={(L + W - R) / 2} y={H - 4} fontSize="11.5" textAnchor="middle">Children with the feature</text>
      </svg>
      <Legend items={[{ color: 'var(--red)', label: 'allergic (n = 6)' }, { color: 'var(--clear)', label: 'delabeled (n = 32)' }]} />
    </>
  )
}

export function Forest() {
  const rows = D.T1.filter(r => r.or !== undefined)
  const W = 640, rh = 20, L = 250, R = 24, Tp = 26, B = 40, H = Tp + rows.length * rh + B, lo = Math.log10(0.01), hi = Math.log10(300)
  const x = v => { v = Math.max(0.01, Math.min(300, v)); return L + ((Math.log10(v) - lo) / (hi - lo)) * (W - L - R) }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Odds ratios for confirmed allergy on a log scale">
      {[0.01, 0.1, 1, 10, 100].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={Tp - 6} y2={H - B + 4} stroke="currentColor" opacity={v === 1 ? 0.55 : 0.12} /><text x={x(v)} y={H - B + 20} fontSize="11" textAnchor="middle">{v}</text></g>)}
      <text x={(L + W - R) / 2} y={H - 6} fontSize="12" textAnchor="middle">Odds ratio (log scale); 1 = no association</text>
      {rows.map((r, i) => {
        const y = Tp + i * rh + rh / 2
        return <g key={r.label}><text x={L - 10} y={y + 4} fontSize="11.5" textAnchor="end">{r.label}</text><line x1={x(r.or_ci[0])} x2={x(r.or_ci[1])} y1={y} y2={y} stroke="var(--bar)" strokeWidth="2" /><rect x={x(r.or) - 4} y={y - 4} width="8" height="8" fill="var(--bar)" /></g>
      })}
    </svg>
  )
}

export function ShareChart() {
  const W = 640, H = 300, L = 60, R = 20, Tp = 20, B = 50
  const x = v => L + ((v - 0.3) / (0.72 - 0.3)) * (W - L - R), y = v => Tp + (1 - (v - 0.5) / 0.5) * (H - Tp - B)
  const cv = { timing: { se: D.loo.rule_se[0] / 6, low: (D.loo.rule_sp[0] + (6 - D.loo.rule_se[0])) / 38 }, score: { se: D.loo.score_se[0] / 6, low: (D.loo.score_sp[0] + (6 - D.loo.score_se[0])) / 38 } }
  const lab = { eaaci: [0, 24, 'middle'], pf: [8, 18, 'start'], t111: [8, -10, 'start'], timing: [10, -12, 'start'], score: null }
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sensitivity versus proportion eligible for direct challenge">
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map(v => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" /><text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end">{Math.round(v * 100)}%</text></g>)}
        {[0.3, 0.4, 0.5, 0.6, 0.7].map(v => <text key={v} x={x(v)} y={H - B + 18} fontSize="11" textAnchor="middle">{Math.round(v * 100)}%</text>)}
        <text x={(L + W - R) / 2} y={H - 10} fontSize="12" textAnchor="middle">Eligible for direct challenge (skin test avoided)</text>
        <text transform={`translate(16 ${(Tp + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle">Sensitivity</text>
        {KEYS.map(k => {
          const m = D.base[k], lowp = m.low / 38, se = m.se.p, c = cv[k], l = lab[k], col = COL[k]
          return (
            <g key={k}>
              {c && <><line x1={x(lowp)} x2={x(c.low)} y1={y(se)} y2={y(c.se)} stroke={col} strokeDasharray="3 3" strokeWidth="1.5" /><circle cx={x(c.low)} cy={y(c.se)} r="5" fill="none" stroke={col} strokeWidth="1.5" /></>}
              <circle cx={x(lowp)} cy={y(se)} r="6" fill={col} />
              {l && <text x={x(lowp) + l[0]} y={y(se) + l[1]} fontSize="11" textAnchor={l[2]}>{k === 'timing' ? 'Timing rule and data-derived score' : NAMES[k].replace(' (<3 points)', '')}</text>}
            </g>
          )
        })}
      </svg>
      <Legend items={KEYS.map(k => ({ color: COL[k], label: NAMES[k] }))} note="Filled circles: estimates in this cohort. Hollow circles joined by dashed lines: leave-one-out estimates for the 2 derived tools." />
    </>
  )
}

export function RocChart() {
  const W = 520, H = 420, L = 56, R = 16, Tp = 14, B = 48, x = v => L + v * (W - L - R), y = v => Tp + (1 - v) * (H - Tp - B)
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="ROC curves for the 5 tools" style={{ maxWidth: 560, margin: '0 auto' }}>
        {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" /><line x1={x(v)} x2={x(v)} y1={Tp} y2={H - B} stroke="currentColor" opacity=".12" /><text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end">{Math.round(v * 100)}%</text><text x={x(v)} y={H - B + 16} fontSize="11" textAnchor="middle">{Math.round(v * 100)}%</text></g>)}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="currentColor" opacity=".3" strokeDasharray="4 4" />
        <text x={(L + W - R) / 2} y={H - 8} fontSize="12" textAnchor="middle">1 − specificity</text>
        <text transform={`translate(14 ${(Tp + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle">Sensitivity</text>
        {KEYS.map(k => {
          const m = D.base[k]
          return <g key={k}><polyline fill="none" stroke={COL[k]} strokeWidth="2.2" strokeDasharray={m.origin === 'der' ? '6 3' : undefined} points={m.roc.map(p => `${x(p[0])},${y(p[1])}`).join(' ')} />{m.roc.filter(p => (p[0] > 0 && p[0] < 1) || (p[1] > 0 && p[1] < 1)).map((p, i) => <circle key={i} cx={x(p[0])} cy={y(p[1])} r="3.5" fill={COL[k]} />)}</g>
        })}
      </svg>
      <Legend items={KEYS.map(k => ({ color: COL[k], dash: D.base[k].origin === 'der', label: `${NAMES[k]}, AUC ${f2(D.base[k].auc)}${D.base[k].origin === 'der' ? ' (apparent)' : ''}` }))} />
    </>
  )
}

export function NpvChart({ sel, p0 }) {
  const W = 640, H = 300, L = 56, R = 20, Tp = 16, B = 48
  const x = v => L + ((v - 0.02) / (0.30 - 0.02)) * (W - L - R), y = v => Tp + (1 - (v - 0.6) / 0.4) * (H - Tp - B)
  const line = (se, sp) => { const pts = []; for (let p = 0.02; p <= 0.3001; p += 0.01) pts.push(`${x(p)},${y(npv(se, sp, p))}`); return pts.join(' ') }
  const m = D.base[sel]
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Negative predictive value of the low-risk group by prevalence">
        {[0.6, 0.7, 0.8, 0.9, 1].map(v => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" /><text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end">{Math.round(v * 100)}%</text></g>)}
        {[0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map(v => <text key={v} x={x(v)} y={H - B + 18} fontSize="11" textAnchor="middle">{Math.round(v * 100)}%</text>)}
        <text x={(L + W - R) / 2} y={H - 8} fontSize="12" textAnchor="middle">Prevalence of true allergy</text>
        <text transform={`translate(14 ${(Tp + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle">NPV of the low-risk group</text>
        {KEYS.filter(k => k !== sel).map(k => <polyline key={k} fill="none" stroke={COL[k]} strokeWidth="1.4" opacity=".35" points={line(D.base[k].se.p, D.base[k].sp.p)} />)}
        <polyline fill="none" stroke={COL[sel]} strokeWidth="2.4" strokeDasharray="6 4" points={line(m.se.lo, m.sp.p)} />
        <polyline fill="none" stroke={COL[sel]} strokeWidth="2.8" points={line(m.se.p, m.sp.p)} />
        <line x1={x(p0)} x2={x(p0)} y1={Tp} y2={H - B} stroke="currentColor" opacity=".5" />
      </svg>
      <Legend items={[{ color: COL[sel], label: `${NAMES[sel]}, point estimate` }, { color: COL[sel], dash: true, label: `cautious: lower 95% bound of sensitivity (${pc(m.se.lo)})` }, { color: 'currentColor', op: 0.35, label: 'other tools, point estimates' }]} />
    </>
  )
}

export function SimScatter({ res }) {
  const A = res[0], pts = res.slice(1).map(o => ({ n: o.n, x: A.skin.m - o.skin.m, y: o.react.m - A.react.m, lo: o.react.lo - A.react.m, hi: o.react.hi - A.react.m }))
  const W = 640, H = 320, L = 60, R = 30, Tp = 16, B = 48, mxY = Math.max(...pts.map(p => p.hi)) * 1.08 || 1, mxX = 1000
  const x = v => L + (v / mxX) * (W - L - R), y = v => Tp + (1 - Math.max(v, 0) / mxY) * (H - Tp - B)
  const cols = ['var(--ink)', 'var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)', 'var(--t5)']
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Skin tests avoided versus extra challenge reactions">
        {[0, 1, 2, 3, 4, 5].map(i => { const v = (mxY * i) / 5; return <g key={i}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" /><text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end">{fmt(v, 0)}</text></g> })}
        {[0, 250, 500, 750, 1000].map(v => <text key={v} x={x(v)} y={H - B + 18} fontSize="11" textAnchor="middle">{v}</text>)}
        <text x={(L + W - R) / 2} y={H - 6} fontSize="12" textAnchor="middle">Skin tests avoided per 1,000 children</text>
        <text transform={`translate(14 ${(Tp + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle">Extra challenge reactions</text>
        {pts.map((p, i) => <g key={p.n}><line x1={x(p.x)} x2={x(p.x)} y1={y(p.lo)} y2={y(p.hi)} stroke={cols[i]} strokeWidth="1.6" opacity=".7" /><circle cx={x(p.x)} cy={y(p.y)} r="6" fill={cols[i]} /><text x={x(p.x) + (p.x > 800 ? -9 : 9)} y={y(p.y) + (i % 2 ? -8 : 14)} fontSize="11" textAnchor={p.x > 800 ? 'end' : 'start'}>{p.n}</text></g>)}
      </svg>
      <Legend items={[]} note="Dots: mean; lines: 95% uncertainty interval. Lower right is better." />
    </>
  )
}

export function Tornado({ metric, prev, stse }) {
  const e = D.base.eaaci
  const base = { p: prev / 100, a: stse / 100, b: 0.968, se: (e.se.k + 0.5) / (e.se.n + 1), sp: (e.sp.k + 0.5) / (e.sp.n + 1) }
  const pars = [
    { n: 'Prevalence of allergy', k: 'p', lo: 0.066, hi: 0.25 }, { n: 'Skin-test sensitivity', k: 'a', lo: 0.189, hi: 0.459 }, { n: 'Skin-test specificity', k: 'b', lo: 0.942, hi: 0.983 },
    { n: 'EAACI/ENDA sensitivity', k: 'se', lo: e.se.lo, hi: e.se.hi }, { n: 'EAACI/ENDA specificity', k: 'sp', lo: e.sp.lo, hi: e.sp.hi },
  ]
  const b0 = det(base)[metric]
  const rows = pars.map(q => { const a = { ...base, [q.k]: q.lo }, b = { ...base, [q.k]: q.hi }; const v1 = det(a)[metric], v2 = det(b)[metric]; return { ...q, v1, v2, span: Math.abs(v1 - v2) } }).sort((p, q) => q.span - p.span)
  const all = [b0]; rows.forEach(r => all.push(r.v1, r.v2))
  let mn = Math.min(...all), mx = Math.max(...all); const pad = (mx - mn) * 0.08 || 1; mx += pad; mn = mn >= 0 ? 0 : mn - pad
  const W = 640, rh = 34, L = 190, R2 = 44, Tp = 24, B = 58, H = Tp + rows.length * rh + B
  const x = v => L + ((v - mn) / (mx - mn)) * (W - L - R2)
  const raw = (mx - mn) / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= raw)
  const ticks = []; for (let v = Math.ceil(mn / step) * step; v <= mx + 1e-9; v += step) ticks.push(v)
  const lab = { react: 'Extra challenge reactions per 1,000 children versus skin testing all', skin: 'Skin tests avoided per 1,000 children', label: 'False labels avoided per 1,000 children' }[metric]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tornado chart of one-way sensitivity analysis">
      {ticks.map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={Tp - 6} y2={H - B + 4} stroke="currentColor" opacity=".1" /><text x={x(v)} y={H - B + 20} fontSize="11" textAnchor="middle">{fmt(v, step < 1 ? 1 : 0)}</text></g>)}
      <line x1={x(b0)} x2={x(b0)} y1={Tp - 6} y2={H - B + 4} stroke="currentColor" opacity=".7" />
      <text x={x(b0)} y="12" fontSize="11" textAnchor="middle">Current inputs: {fmt(b0, 1)}</text>
      {rows.map((r, i) => {
        const y = Tp + i * rh + rh / 2, a = Math.min(r.v1, r.v2), b = Math.max(r.v1, r.v2), near = x(a) - L < 34
        return (
          <g key={r.n}>
            <text x={L - 10} y={y - 2} fontSize="12" textAnchor="end">{r.n}</text>
            <text x={L - 10} y={y + 12} fontSize="10.5" textAnchor="end" opacity=".7">{pc(r.lo)} to {pc(r.hi)}</text>
            <rect x={x(a)} y={y - 9} width={Math.max(x(b) - x(a), 1)} height="18" fill="var(--bar)" opacity=".85" rx="2" />
            {near ? <text x={x(b) + 5} y={y + 4} fontSize="10.5">{fmt(a, 1)} to {fmt(b, 1)}</text> : <><text x={x(b) + 5} y={y + 4} fontSize="10.5">{fmt(b, 1)}</text><text x={x(a) - 5} y={y + 4} fontSize="10.5" textAnchor="end">{fmt(a, 1)}</text></>}
          </g>
        )
      })}
      <text x={(L + W - R2) / 2} y={H - 8} fontSize="12" textAnchor="middle">{lab}</text>
    </svg>
  )
}

export function PlanChart({ tgt }) {
  const cur = D.base.eaaci
  const W = 640, H = 280, L = 56, R2 = 20, Tp = 16, B = 46, maxN = 300, maxY = 0.25
  const x = v => L + (v / maxN) * (W - L - R2), y = v => Tp + (1 - Math.min(v, maxY) / maxY) * (H - Tp - B)
  const cols = ['var(--t1)', 'var(--t2)', 'var(--t5)']
  const curve = k => { const pts = []; for (let n = Math.max(k, 1) + (k ? 2 : 0); n <= maxN; n += n < 60 ? 2 : 6) pts.push(`${x(n)},${y(cpUpper(k, n))}`); return pts.join(' ') }
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Upper 95% bound of the miss rate against the number of low-risk children">
        {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map(v => <g key={v}><line x1={L} x2={W - R2} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" /><text x={L - 8} y={y(v) + 4} fontSize="11" textAnchor="end">{Math.round(v * 100)}%</text></g>)}
        {[0, 50, 100, 150, 200, 250, 300].map(v => <text key={v} x={x(v)} y={H - B + 18} fontSize="11" textAnchor="middle">{v}</text>)}
        <text x={(L + W - R2) / 2} y={H - 6} fontSize="12" textAnchor="middle">Low-risk children challenged</text>
        <text transform={`translate(14 ${(Tp + H - B) / 2}) rotate(-90)`} fontSize="12" textAnchor="middle">Upper 95% bound of miss rate</text>
        <line x1={L} x2={W - R2} y1={y(tgt)} y2={y(tgt)} stroke="var(--red)" strokeDasharray="5 4" />
        <text x={W - R2} y={y(tgt) - 5} fontSize="11" textAnchor="end" fill="var(--red)">Target {pc(tgt)}</text>
        {[0, 1, 2].map(k => <polyline key={k} fill="none" stroke={cols[k]} strokeWidth="2.2" points={curve(k)} />)}
        <circle cx={x(cur.low)} cy={y(1 - cur.npv.lo)} r="5" fill="var(--ink)" /><text x={x(cur.low) + 8} y={y(1 - cur.npv.lo) + 4} fontSize="11">This cohort</text>
      </svg>
      <Legend items={[{ color: cols[0], label: '0 misses' }, { color: cols[1], label: '1 miss' }, { color: cols[2], label: '2 misses' }]} />
    </>
  )
}
