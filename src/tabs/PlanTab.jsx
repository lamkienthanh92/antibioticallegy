import { useState } from 'react'
import D from '../data/cohort.json'
import { PlanChart } from '../components/Charts'
import { pc, fmt } from '../lib/format'
import { needLow } from '../lib/stats'

export default function PlanTab() {
  const [prev, setPrev] = useState(15.8), [low, setLow] = useState(42), [tgt, setTgt] = useState(5)
  const lo = low / 100, pr = prev / 100, tg = tgt / 100, cur = D.base.eaaci
  const rows = [0, 1, 2].map(k => { const n = needLow(k, tg); return n ? { k, n, N: Math.ceil(n / lo), na: Math.ceil(n / lo) * pr } : { k } })
  const r0 = rows[0]
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-plan">
      <h2>How big should the validation study be?</h2>
      <p className="lead">Low-risk children needed to show the miss rate is below a limit.</p>
      <div className="plan">
        <div className="ctrl">
          <h3>Assumptions</h3>
          <label className="sl" htmlFor="pl-prev" style={{ marginTop: 0 }}>Prevalence of true allergy <output>{prev.toFixed(1)}%</output></label>
          <input type="range" id="pl-prev" min="3" max="30" step="0.1" value={prev} onChange={e => setPrev(parseFloat(e.target.value))} />
          <label className="sl" htmlFor="pl-low">Children classified low risk <output>{low}%</output></label>
          <input type="range" id="pl-low" min="15" max="70" step="1" value={low} onChange={e => setLow(parseFloat(e.target.value))} />
          <p className="hint">EAACI/ENDA in this cohort: 42%.</p>
          <label className="sl" htmlFor="pl-tgt">Highest acceptable miss rate in the low-risk group <output>{tgt.toFixed(1)}%</output></label>
          <input type="range" id="pl-tgt" min="1" max="15" step="0.5" value={tgt} onChange={e => setTgt(parseFloat(e.target.value))} />
          <p className="hint">The study is large enough when the upper 95% bound falls below this value.</p>
        </div>
        <div>
          <div className="tablewrap tight"><table>
            <thead><tr><th>Allergic children missed in the low-risk group</th><th className="num">Low-risk children needed</th><th className="num">Children to enrol</th><th className="num">Allergic children expected</th></tr></thead>
            <tbody>{rows.map(r => r.n ? <tr key={r.k}><td>{r.k}</td><td className="num">{r.n}</td><td className="num">{r.N}</td><td className="num">{fmt(r.na, 0)}</td></tr> : <tr key={r.k}><td>{r.k}</td><td className="num" colSpan={3}>more than 3,000 low-risk children</td></tr>)}</tbody>
          </table></div>
          <div className="summary">
            This cohort had {cur.low} low-risk children with no miss, so a miss rate up to <b>{pc(1 - cur.npv.lo)}</b> is still possible.{' '}
            {r0.n ? <>With no misses and a limit of <b>{pc(tg)}</b>, you need <b>{r0.n}</b> low-risk children, about <b>{r0.N}</b> enrolled if {low}% are low risk. With 1 miss: <b>{rows[1].n || 'many'}</b>.</> : 'The target is not reachable within 3,000 low-risk children.'}
          </div>
          <div className="chart"><PlanChart tgt={tg} /></div>
          <p className="note">With 24–32 allergic children and no misses, the lower bound for sensitivity is still about 86–89%.</p>
        </div>
      </div>
    </section>
  )
}
