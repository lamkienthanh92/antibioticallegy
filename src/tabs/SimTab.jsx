import { useDeferredValue, useMemo, useState } from 'react'
import { runSim, METRIC } from '../lib/sim'
import { SimScatter, Tornado } from '../components/Charts'
import { fmt } from '../lib/format'

const INIT = { prev: 15.8, stse: 31, sev: 1.4, alt: 25, red: 50, c1: 1, c2: 2, c3: 30, c4: 10, c5: 3, cv: true }

function Slider({ id, label, min, max, step, val, set, unit = '', hint }) {
  return (
    <>
      <label className="sl" htmlFor={id}>{label} <output>{val}{unit}</output></label>
      <input type="range" id={id} min={min} max={max} step={step} value={val} onChange={e => set(id, parseFloat(e.target.value))} />
      {hint && <p className="hint">{hint}</p>}
    </>
  )
}

export default function SimTab() {
  const [P, setP] = useState(INIT)
  const [metric, setMetric] = useState('skin')
  const [tor, setTor] = useState('react')
  const dP = useDeferredValue(P)
  const res = useMemo(() => runSim(dP), [dP])
  const set = (k, v) => setP(p => ({ ...p, [k]: v }))
  const A = res[0], B = res[1], E = res[2]
  const d = METRIC[metric][1]
  const max = Math.max(...res.map(o => o[metric].hi)) || 1
  const perPrev = (A.skin.m - B.skin.m) / Math.max(B.react.m - A.react.m, 0.001), perSev = (A.skin.m - B.skin.m) / Math.max(B.severe.m - A.severe.m, 0.0001)
  const csv = () => {
    const cols = ['skin', 'dpt', 'react', 'severe', 'falselab', 'delab', 'fq', 'cost']
    const L = ['Strategy,' + cols.map(c => `${METRIC[c][0]} mean,${METRIC[c][0]} lower 95%,${METRIC[c][0]} upper 95%`).join(',')]
    res.forEach(o => L.push(`"${o.n}",` + cols.map(c => [o[c].m, o[c].lo, o[c].hi].map(v => v.toFixed(2)).join(',')).join(',')))
    L.push(''); L.push(`"Inputs: prevalence ${P.prev}%, skin-test sensitivity ${P.stse}%, severe share ${P.sev}%, fluoroquinolone while waiting ${P.alt}%, reduction ${P.red}%. Per 1,000 children; 2,000 draws; seed 20261011."`)
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.join('\n')], { type: 'text/csv' })); a.download = 'decision-model-results.csv'; document.body.appendChild(a); a.click(); a.remove()
  }
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-sim">
      <h2>Modeling 1,000 children with a suspected beta-lactam reaction</h2>
      <p className="lead">Bars: mean; whiskers: 95% uncertainty interval (2,000 draws).</p>
      <div className="simgrid">
        <div className="ctrl">
          <h3>Population</h3>
          <div className="seg" style={{ margin: '0 0 6px' }}>
            <button className="btn" type="button" onClick={() => set('prev', 15.8)}>This cohort: 15.8%</button>
            <button className="btn" type="button" onClick={() => set('prev', 6.6)}>Literature: 6.6%</button>
          </div>
          <Slider id="prev" label="Prevalence of true allergy" min={2} max={30} step={0.1} val={P.prev} set={set} unit="%" hint="Pediatric literature: about 6.6% react to direct challenge." />
          <h3>Data-derived tools</h3>
          <div className="seg" role="radiogroup" aria-label="Estimate">
            <label><input type="radio" name="est" checked={P.cv} onChange={() => set('cv', true)} />Cross-validated (conservative)</label>
            <label><input type="radio" name="est" checked={!P.cv} onChange={() => set('cv', false)} />Apparent (optimistic)</label>
          </div>
          <h3>Literature inputs</h3>
          <Slider id="stse" label="Skin test sensitivity" min={10} max={70} step={1} val={P.stse} set={set} unit="%" hint="2021 meta-analysis: 30.7% (18.9–45.9)." />
          <Slider id="sev" label="Severe reactions among challenge reactions" min={0.2} max={5} step={0.1} val={P.sev} set={set} unit="%" hint="2024 meta-analysis, children: 4 severe of 315 reactions." />
          <h3>Antimicrobial stewardship</h3>
          <Slider id="alt" label="Children given a fluoroquinolone while awaiting testing" min={0} max={60} step={1} val={P.alt} set={set} unit="%" hint="This cohort: 9 of 36 children received levofloxacin while waiting." />
          <Slider id="red" label="Reduction in that exposure with direct challenge" min={0} max={100} step={5} val={P.red} set={set} unit="%" hint="Assumption, no data. Set to 0% to ignore this benefit." />
          <details><summary>Relative costs</summary>
            <p className="hint">Relative units. Replace with your hospital's prices.</p>
            <Slider id="c1" label="One skin test" min={0} max={10} step={0.5} val={P.c1} set={set} />
            <Slider id="c2" label="One drug challenge" min={0} max={10} step={0.5} val={P.c2} set={set} />
            <Slider id="c3" label="Managing one severe reaction" min={0} max={100} step={5} val={P.c3} set={set} />
            <Slider id="c4" label="One false label retained" min={0} max={50} step={1} val={P.c4} set={set} />
            <Slider id="c5" label="One alternative antibiotic course" min={0} max={20} step={0.5} val={P.c5} set={set} />
          </details>
        </div>
        <div>
          <div className="metric-tabs" role="group" aria-label="Choose outcome">
            {Object.entries(METRIC).map(([k, [t]]) => <button type="button" key={k} aria-pressed={k === metric} onClick={() => setMetric(k)}>{t}</button>)}
          </div>
          <div className="bars" aria-live="polite">
            <p className="meta" style={{ margin: '6px 0 2px' }}>{METRIC[metric][0]} per 1,000 children</p>
            {res.map(o => { const r = o[metric]; return (
              <div className="brow" key={o.n}><div className="lab">{o.n}</div>
                <div className="track"><div className="fill" style={{ width: `${(r.m / max) * 100}%` }} /><div className="whisk" style={{ left: `${(r.lo / max) * 100}%`, width: `${Math.max(((r.hi - r.lo) / max) * 100, 0.4)}%` }} /></div>
                <div className="val">{fmt(r.m, d)}<small>{fmt(r.lo, d)}–{fmt(r.hi, d)}</small></div></div>) })}
          </div>
          <div className="summary">EAACI/ENDA versus skin testing all, per 1,000 children: <b>{fmt(A.skin.m - E.skin.m, 0)}</b> skin tests and <b>{fmt(A.falselab.m - E.falselab.m, 1)}</b> false labels avoided, <b>{fmt(E.react.m - A.react.m, 1)}</b> extra challenge reactions. About <b>{fmt(perPrev, 0)}</b> skin tests prevent 1 reaction; about <b>{fmt(perSev, 0)}</b> prevent 1 severe reaction.</div>
          <h3 className="sub">Skin tests avoided versus extra reactions</h3>
          <div className="chart"><SimScatter res={res} /></div>
          <details className="more"><summary>Table: compared with skin testing every child</summary>
            <div className="tablewrap"><table>
              <thead><tr><th>Strategy</th><th className="num">Skin tests avoided</th><th className="num">Extra challenge reactions</th><th className="num">False labels avoided</th><th className="num">Fluoroquinolone courses avoided</th><th className="num">Skin tests avoided per extra reaction</th></tr></thead>
              <tbody>{res.slice(1).map(o => { const sk = A.skin.m - o.skin.m, rx = o.react.m - A.react.m; return <tr key={o.n}><td>{o.n}</td><td className="num">{fmt(sk, 0)}</td><td className="num">{fmt(rx, 1)}</td><td className="num">{fmt(A.falselab.m - o.falselab.m, 1)}</td><td className="num">{fmt(A.fq.m - o.fq.m, 1)}</td><td className="num">{rx > 0.05 ? fmt(sk / rx, 0) : '—'}</td></tr> })}</tbody>
            </table></div>
          </details>
          <h3 className="sub">Which inputs move the EAACI/ENDA result most?</h3>
          <div className="seg2" role="group" aria-label="Choose outcome for the tornado chart">
            {[['react', 'Extra challenge reactions'], ['skin', 'Skin tests avoided'], ['label', 'False labels avoided']].map(([k, t]) => <button type="button" key={k} aria-pressed={k === tor} onClick={() => setTor(k)}>{t}</button>)}
          </div>
          <div className="chart"><Tornado metric={tor} prev={P.prev} stse={P.stse} /></div>
          <div className="actions"><button className="btn" type="button" onClick={csv}>Download results as CSV</button></div>
          <details className="more"><summary>Model notes</summary><p className="note">False labels: nonallergic children with a false-positive skin test who keep the label. Reactions occur under supervision. No cross-reactivity; not for anaphylaxis or severe skin reactions.</p></details>
        </div>
      </div>
    </section>
  )
}
