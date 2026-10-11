import { useState } from 'react'
import D from '../data/cohort.json'
import { DotCI, ShareChart, RocChart, NpvChart } from '../components/Charts'
import { KEYS, NAMES, SHORT, COL, pc, ciT, f2, pv, frac } from '../lib/format'
import { npv } from '../lib/stats'

const Pill = ({ k }) => <span className={`pill ${D.base[k].origin === 'ext' ? 'ext' : 'der'}`}>{D.base[k].origin === 'ext' ? 'External' : 'Derived'}</span>

export default function CompareTab() {
  const [sel, setSel] = useState('eaaci')
  const [p0, setP0] = useState(15.8)
  const panel = (title, fn) => (
    <div className="chart flush"><h4>{title}</h4>
      <DotCI L={100} W={480} rows={KEYS.map(k => { const p = fn(D.base[k]); return { label: SHORT[k], p: p.p, lo: p.lo, hi: p.hi, sub: frac(p), col: COL[k] } })} axis="95% CI" />
    </div>
  )
  const pr = p0 / 100
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-models">
      <h2>5 tools in the same 38 children</h2>
      <p className="lead">Low-risk group = eligible for direct challenge without skin testing.</p>
      <div className="cols2">
        {panel('Sensitivity', m => m.se)}{panel('Specificity', m => m.sp)}{panel('NPV of the low-risk group', m => m.npv)}{panel('Share eligible for direct challenge', m => m.lowshare)}
      </div>
      <details className="more"><summary>Numbers: safety and discrimination</summary>
        <h3 className="sub">Is the low-risk group safe?</h3>
        <div className="tablewrap"><table>
          <thead><tr><th>Tool</th><th>Origin</th><th className="num">Low risk</th><th className="num">Allergic in low-risk group</th><th className="num">NPV (95% CI)</th><th className="num">Worst plausible miss rate<small>upper 95% bound</small></th></tr></thead>
          <tbody>{KEYS.map(k => { const m = D.base[k]; return <tr key={k}><td>{NAMES[k]}</td><td><Pill k={k} /></td><td className="num">{m.low}/38</td><td className={`num ${m.missed ? 'bad' : 'ok'}`}>{m.missed}</td><td className="num">{ciT(m.npv)}</td><td className="num">{pc(1 - m.npv.lo)}</td></tr> })}</tbody>
        </table></div>
        <h3 className="sub">How well does each tool separate the groups?</h3>
        <div className="tablewrap"><table>
          <thead><tr><th>Tool</th><th className="num">Sensitivity</th><th className="num">Specificity</th><th className="num">LR+</th><th className="num">LR−</th><th className="num">PPV of other groups</th><th className="num">AUC (95% CI)</th></tr></thead>
          <tbody>{KEYS.map(k => { const m = D.base[k]; return <tr key={k}><td>{NAMES[k]}</td><td className="num">{ciT(m.se)}</td><td className="num">{ciT(m.sp)}</td>
            <td className="num">{f2(m.lrp)} <small>{f2(m.lrp_ci[0])}–{f2(m.lrp_ci[1])}</small></td><td className="num">{f2(m.lrn)} <small>{f2(m.lrn_ci[0])}–{f2(m.lrn_ci[1])}</small></td>
            <td className="num">{ciT(m.ppv)}</td><td className="num">{f2(m.auc)} ({f2(m.auc_ci[0])}–{f2(m.auc_ci[1])}){k === 'score' && <small>optimism-corrected {f2(D.loo.corr_auc)}</small>}</td></tr> })}</tbody>
        </table></div>
        <p className="note" style={{ marginTop: 8 }}>Sensitivity and specificity: classification outside the low-risk group. AUC intervals: bootstrap.</p>
        <h3 className="sub">2 × 2 tables</h3>
        <div className="cols2">{KEYS.map(k => { const m = D.base[k]; return <div key={k}><b>{NAMES[k]}</b>
          <table className="cm"><thead><tr><th /><th>Allergic</th><th>Not allergic</th></tr></thead><tbody><tr><th>Outside low-risk group</th><td>{m.tp}</td><td>{m.fp}</td></tr><tr><th>Low-risk group</th><td className={m.fn ? 'bad' : 'ok'}>{m.fn}</td><td>{m.tn}</td></tr></tbody></table></div> })}</div>
      </details>
      <div className="callout"><b>Note.</b> The 3 external tools were not fitted to these children. The 2 derived tools missed 2 of 6 allergic children on cross-validation.</div>
      <h3 className="sub">Sensitivity against the share of children eligible for direct challenge</h3>
      <div className="chart"><ShareChart /></div>
      <h3 className="sub">ROC curves</h3>
      <div className="chart"><RocChart /></div>
      <h3 className="sub">Difference from EAACI/ENDA</h3>
      <div className="chart"><DotCI L={110} min={-0.2} max={0.6} step={0.2} zero fmt={v => v.toFixed(1)} axis="AUC of EAACI/ENDA minus AUC of the tool (positive = EAACI/ENDA higher)"
        rows={['pf', 't111', 'timing', 'score'].map(k => { const q = D.paired[k]; return { label: SHORT[k], p: q.auc_diff, lo: q.auc_diff_ci[0], hi: q.auc_diff_ci[1], sub: (q.auc_diff >= 0 ? '+' : '') + f2(q.auc_diff), col: COL[k] } })} /></div>
      <details className="more"><summary>Paired comparison table</summary>
        <div className="tablewrap"><table>
          <thead><tr><th>Compared with EAACI/ENDA</th><th className="num">Difference in AUC<small>bootstrap 95% CI</small></th><th className="num">Allergic children flagged differently<small>EAACI only / tool only; exact McNemar P</small></th><th className="num">Children in low-risk group<small>tool minus EAACI; exact McNemar P</small></th></tr></thead>
          <tbody>{['pf', 't111', 'timing', 'score'].map(k => { const p = D.paired[k]; return <tr key={k}><td>{NAMES[k]} <Pill k={k} /></td><td className="num">{p.auc_diff >= 0 ? '+' : ''}{f2(p.auc_diff)} ({f2(p.auc_diff_ci[0])} to {f2(p.auc_diff_ci[1])})</td><td className="num">{p.sens_disc[0]} / {p.sens_disc[1]}, P = {pv(p.sens_p)}</td><td className="num">{p.low_diff >= 0 ? '+' : ''}{p.low_diff} ({p.low_disc[0]} EAACI only / {p.low_disc[1]} tool only), P = {pv(p.low_p)}</td></tr> })}</tbody>
        </table></div>
        <p className="note" style={{ marginTop: 8 }}>Paired, exploratory; 6 allergic children.</p>
      </details>
      <h3 className="sub">NPV of the low-risk group by prevalence</h3>
      <p className="lead">Dashed line: cautious, using the lower 95% bound of sensitivity.</p>
      <div className="seg2" role="group" aria-label="Choose tool">{KEYS.map(k => <button type="button" key={k} aria-pressed={k === sel} onClick={() => setSel(k)}>{SHORT[k]}</button>)}</div>
      <div className="chart"><NpvChart sel={sel} p0={pr} /></div>
      <div className="ctrl" style={{ margin: '10px 0', maxWidth: 420 }}>
        <label className="sl" htmlFor="npvp" style={{ marginTop: 0 }}>Prevalence of true allergy <output>{p0.toFixed(1)}%</output></label>
        <input type="range" id="npvp" min="2" max="30" step="0.1" value={p0} onChange={e => setP0(parseFloat(e.target.value))} />
      </div>
      <details className="more"><summary>NPV at the chosen prevalence</summary>
        <div className="tablewrap tight"><table>
          <thead><tr><th>Tool</th><th className="num">NPV, point estimate</th><th className="num">NPV, cautious</th><th className="num">Missed allergies per 1,000 low-risk children, cautious</th></tr></thead>
          <tbody>{KEYS.map(k => { const q = D.base[k], a = npv(q.se.p, q.sp.p, pr), b = npv(q.se.lo, q.sp.p, pr); return <tr key={k}><td>{NAMES[k]}</td><td className="num">{pc(a)}</td><td className="num">{pc(b)}</td><td className="num">{Math.round((1 - b) * 1000)}</td></tr> })}</tbody>
        </table></div>
      </details>
    </section>
  )
}
