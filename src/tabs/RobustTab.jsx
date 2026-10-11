import D from '../data/cohort.json'
import { DotCI } from '../components/Charts'
import { KEYS, NAMES, pc } from '../lib/format'

export default function RobustTab() {
  const S = D.S
  const items = []
  items.push(S.every(s => s.tools.eaaci.missed === 0) ? 'EAACI/ENDA: no miss in any scenario, but intervals stay wide.' : 'EAACI/ENDA missed a child in some scenarios.')
  if (S[1].tools.pf.missed === 0) items.push('PEN-FAST’s only miss is the intradermal-positive child.')
  if (S[6].tools.t111.missed === 0) items.push(`1-1-1’s only miss is a non-urticaria rash; in urticaria it cleared ${S[6].tools.t111.low} of ${S[6].n} children with no miss.`)
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-robust">
      <h2>Do the conclusions survive different choices?</h2>
      <p className="lead">Allergic children missed in the low-risk group, under 8 alternative choices.</p>
      <div className="chart">
        <div className="tablewrap" style={{ border: 0 }}><table className="hm">
          <thead><tr><th>Scenario</th>{KEYS.map(k => <th key={k} style={{ textAlign: 'center' }}>{NAMES[k].replace(' (<3 points)', '').replace(' (≤2 points)', '')}</th>)}</tr></thead>
          <tbody>{S.map(sc => (
            <tr key={sc.label}><td className="rowl" title={sc.note}><b style={{ fontSize: '.9rem' }}>{sc.label}</b><small>{sc.n} children · {sc.na} allergic</small></td>
              {KEYS.map(k => { const t = sc.tools[k]; return <td key={k} className={t.missed ? 'bad' : 'ok'} title={`NPV ${pc(t.npv.p, 0)}`}><b>{t.missed}</b><small>of {t.low} low</small></td> })}</tr>
          ))}</tbody>
        </table></div>
        <div className="legend"><span><i style={{ borderColor: 'var(--clear)' }} />no miss</span><span><i style={{ borderColor: 'var(--red)' }} />missed allergic child</span><span>Small print: children in the low-risk group</span></div>
      </div>
      <div className="chart"><h4>EAACI/ENDA: miss rate in the low-risk group (95% CI)</h4>
        <DotCI L={330} W={760} max={0.6} step={0.1} axis="Miss rate" fmt={v => Math.round(v * 100) + '%'}
          rows={S.map(sc => { const q = sc.tools.eaaci, np = q.npv; return { label: sc.label, p: 1 - np.p, lo: 1 - np.hi, hi: 1 - np.lo, sub: `${q.missed}/${q.low}`, col: 'var(--t1)' } })} />
      </div>
      <div className="callout"><ul className="refs" style={{ margin: 0, maxWidth: 'none' }}>{items.map(t => <li key={t}>{t}</li>)}</ul></div>
    </section>
  )
}
