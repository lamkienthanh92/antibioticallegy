import { Fragment } from 'react'
import D from '../data/cohort.json'
import { DotCI, PathBars, PairDots, Forest } from '../components/Charts'
import { pc, pv, f2, frac } from '../lib/format'
import { propR } from '../lib/stats'

const GROUPS = [['Demographics', 0, 5], ['Diagnosis', 5, 9], ['Suspected antibiotic', 9, 13], ['Index reaction', 13, 16], ['Timing', 16, 22], ['Treatment and history', 22, 28], ['Work-up', 28, 29]]
const iqr = a => `${a[0]} (${Math.round(a[1])}–${Math.round(a[2])})`

export default function CohortTab() {
  const fo = D.follow, lv = fo.levo
  const scores = [
    ['1-1-1 criteria met (of 3)', D.dist.t111, l => `${l} met`], ['Data-derived score', D.dist.score, l => `${l} pts`],
    ['PEN-FAST score', D.dist.pf, l => `${l} pts`], ['EAACI/ENDA category', D.dist.eaaci, l => ['Low', 'Intermediate', 'High'][l]],
  ]
  const stew = [
    { label: 'Fluoroquinolone while awaiting evaluation', q: propR(lv.k, lv.n), col: 'var(--t2)' },
    { label: '…later delabeled (of those given it)', q: propR(fo.levo_delab, lv.k) },
    { label: 'Delabeled children with follow-up', q: propR(fo.fu, fo.delab), col: 'var(--t3)' },
    { label: '…drug used again without reaction', q: propR(fo.reuse_yes, fo.fu) },
  ].map(r => ({ label: r.label, col: r.col, p: r.q.p, lo: r.q.lo, hi: r.q.hi, sub: frac(r.q) }))
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-cohort">
      <h2>The derivation cohort</h2>
      <p className="lead">38 children with a suspected antibiotic reaction; 6 confirmed allergic. Intervals are exact 95%.</p>
      <h3 className="sub">Work-up pathway</h3>
      <div className="chart"><PathBars /></div>
      <h3 className="sub">What separates allergic from delabeled children</h3>
      <div className="chart"><PairDots /></div>
      <h3 className="sub">Odds ratios</h3>
      <div className="chart"><Forest /></div>
      <h3 className="sub">Allergy rate by subgroup</h3>
      <div className="chart"><DotCI L={240} rows={D.SUB.map(r => ({ label: r.label, p: r.p, lo: r.lo, hi: r.hi, sub: frac(r) }))} /></div>
      <h3 className="sub">Allergy rate by tool score</h3>
      <div className="cols2">
        {scores.map(([title, arr, lab]) => (
          <div className="chart flush" key={title}><h4>{title}</h4>
            <DotCI L={90} rh={24} W={420} axis="Allergic (95% CI)" rows={arr.map(r => ({ label: lab(r.level), p: r.p, lo: r.lo, hi: r.hi, sub: frac(r), col: 'var(--t5)' }))} />
          </div>
        ))}
      </div>
      <h3 className="sub">Antibiotic use and follow-up</h3>
      <div className="chart"><DotCI L={250} rows={stew} /></div>
      <details className="more"><summary>Full characteristics table</summary>
        <div className="tablewrap"><table className="t1">
          <thead><tr><th>Characteristic</th><th className="num">All (n = 38)</th><th className="num">Allergic (n = 6)</th><th className="num">Delabeled (n = 32)</th><th className="num">OR (95% CI)</th><th className="num">P</th></tr></thead>
          <tbody>
            {GROUPS.map(([name, a, b]) => (
              <Fragment key={name}>
                <tr className="sec"><th colSpan={6}>{name}</th></tr>
                {name === 'Demographics' && <tr key="age"><td>Age, months, median (IQR)</td><td className="num">{iqr(D.age.all)}</td><td className="num">{iqr(D.age.a)}</td><td className="num">{iqr(D.age.b)}</td><td className="num">—</td><td className="num">{pv(D.age.p)}</td></tr>}
                {D.T1.slice(a, b).map(r => (
                  <tr key={r.label}><td>{r.label}</td><td className="num">{r.all} ({pc(r.all / 38)})</td><td className="num">{r.a} ({pc(r.a / 6)})</td><td className="num">{r.b} ({pc(r.b / 32)})</td>
                    <td className="num">{r.or !== undefined ? `${f2(r.or)} (${f2(r.or_ci[0])}–${r.or_ci[1] >= 100 ? r.or_ci[1].toFixed(0) : f2(r.or_ci[1])})` : '—'}</td><td className="num">{r.p !== undefined ? pv(r.p) : '—'}</td></tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table></div>
        <p className="note" style={{ marginTop: 8 }}>Fisher exact P, Haldane–Anscombe OR; descriptive only. Missing duration (2 children) counted as not resolved within 1 day.</p>
      </details>
    </section>
  )
}
