import { Fragment, useMemo, useState } from 'react'
import D from '../data/cohort.json'
import { assess, emptyForm, EXAMPLES, NEXT, BAND } from '../lib/assess'
import { frac, ciS, pc, LABEL } from '../lib/format'

function Chips({ legend, hint, name, value, onChange, options, multi }) {
  return (
    <fieldset>
      <legend>{legend}{hint && <small>{hint}</small>}</legend>
      <div className="chips">
        {options.map(o => (
          <label key={o.v} className={o.warn ? 'warn' : ''}>
            <input type={multi ? 'checkbox' : 'radio'} name={name} checked={multi ? !!value[o.v] : value === o.v} onChange={() => onChange(o.v)} />
            <span>{o.t}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ctx(res, e, s, triad) {
  if (s.scar || s.sys) return { note: 'No child in the cohort had anaphylaxis or a severe cutaneous reaction, so the cohort cannot inform this result.' }
  const rows = [], map = { low: 0, mid: 1, high: 2 }
  if (e.cat && map[e.cat] !== undefined) { const x = D.dist.eaaci[map[e.cat]]; rows.push([`EAACI/ENDA ${LABEL[e.cat].toLowerCase()} risk`, `${frac(x)} allergic (${ciS(x)})`]) }
  const pf = res[1]
  if (pf.cat && pf.score !== undefined) { const m = D.dist.pf.find(z => z.level === pf.score); rows.push([`PEN-FAST ${pf.score} points`, m ? `${frac(m)} allergic (${ciS(m)})` : 'no child with this score']) }
  if (triad !== null) { const t3 = D.dist.t111[triad]; rows.push([`1-1-1: ${triad} of 3 criteria met`, `${frac(t3)} allergic (${ciS(t3)})`]) }
  const sc = res[4]
  if (sc.cat && sc.score !== undefined) { const m2 = D.dist.score[sc.score]; rows.push([`Data-derived score ${sc.score}/4`, `${frac(m2)} allergic (${ciS(m2)})`]) }
  return { rows, low: e.cat === 'low' }
}

export default function AssessTab({ form, setForm }) {
  const [msg, setMsg] = useState('')
  const out = useMemo(() => assess(form), [form])
  const { res, e, triad, s } = out
  const cat = e.cat
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const toggleSx = v => setForm(f => ({ ...f, sx: { ...f.sx, [v]: !f.sx[v] } }))
  const applicable = res.filter(x => x.cat && x.cat !== 'na')
  const same = applicable.filter(x => x.cat === cat || (cat !== 'low' && x.cat !== 'low')).length
  const conflict = cat === 'low' && applicable.some(x => x.cat === 'high' || x.cat === 'mid')
  const c = cat ? ctx(res, e, s, triad) : null
  const bandTitle = cat ? BAND[cat][0] : 'Not enough information'
  const copy = async () => {
    const L = ['Beta-lactam allergy risk assessment (research tool, not validated)', 'EAACI/ENDA pathway: ' + bandTitle]
    res.forEach(x => L.push(`- ${x.name}: ${x.cat ? LABEL[x.cat] : 'insufficient data'}${x.why ? ` (${x.why})` : ''}`))
    try { await navigator.clipboard.writeText(L.join('\n')); setMsg('Summary copied.') } catch { setMsg('Copy failed. Select the result and copy it manually.') }
  }
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-assess">
      <div className="assess">
        <div>
          <h2>Reaction history</h2>
          <p className="lead">Answer for the most recent suspected reaction. Results update as you choose.</p>
          <div className="examples">
            <button className="btn" type="button" onClick={() => setForm(EXAMPLES.low)}>Example: rash after 3 days of amoxicillin</button>
            <button className="btn" type="button" onClick={() => setForm(EXAMPLES.high)}>Example: hives 20 minutes after the first dose, recurred before</button>
            <button className="btn" type="button" onClick={() => setForm(emptyForm)}>Clear all</button>
          </div>
          <Chips legend="Suspected antibiotic" name="drug" value={form.drug} onChange={set('drug')} options={[{ v: 'pen', t: 'Amoxicillin / amoxicillin–clavulanate' }, { v: 'ceph', t: 'Cephalosporin' }, { v: 'other', t: 'Other class' }]} />
          <Chips legend="Manifestations" hint="Select all that apply" multi name="sx" value={form.sx} onChange={toggleSx} options={[{ v: 'urt', t: 'Urticaria' }, { v: 'mpe', t: 'Maculopapular rash' }, { v: 'angio', t: 'Angioedema' }, { v: 'sys', t: 'Systemic: dyspnea, wheeze, hypotension, vomiting', warn: 1 }, { v: 'scar', t: 'Severe skin: blisters, skin detachment, mucosal erosions, fever with eosinophilia, widespread pustules', warn: 1 }]} />
          <Chips legend="Onset after the dose" name="onset" value={form.onset} onChange={set('onset')} options={[{ v: 'lt1', t: 'Within 1 hour' }, { v: '1to6', t: '1–6 hours' }, { v: 'gt6', t: 'After 6 hours' }, { v: 'unk', t: 'Unknown' }]} />
          <Chips legend="Appeared after" name="dose" value={form.dose} onChange={set('dose')} options={[{ v: 'first', t: 'The first dose' }, { v: 'later', t: 'The second dose or later' }]} />
          <Chips legend="Symptom duration" hint="From stopping the drug" name="dur" value={form.dur} onChange={set('dur')} options={[{ v: 'le1', t: 'Resolved within 1 day' }, { v: '1to3', t: 'More than 1 to 3 days' }, { v: 'gt3', t: 'More than 3 days' }]} />
          <Chips legend="Treated with medication" hint="Antihistamine, corticosteroid, or epinephrine" name="tx" value={form.tx} onChange={set('tx')} options={[{ v: 'yes', t: 'Yes' }, { v: 'no', t: 'No' }]} />
          <Chips legend="Previous exposure to the same drug" name="prior" value={form.prior} onChange={set('prior')} options={[{ v: 'never', t: 'Never' }, { v: 'ok', t: 'Yes, tolerated' }, { v: 'react', t: 'Yes, with a similar reaction', warn: 1 }]} />
          <Chips legend="Moderate maculopapular rash" hint="Over 50% of the body, lasting more than 7 days, or needing systemic corticosteroids" name="mpemod" value={form.mpemod} onChange={set('mpemod')} options={[{ v: 'yes', t: 'Yes' }, { v: 'no', t: 'No' }]} />
          <Chips legend="Time since the reaction" name="since" value={form.since} onChange={set('since')} options={[{ v: 'le5', t: 'Within 5 years' }, { v: 'gt5', t: 'More than 5 years' }]} />
        </div>
        <div className="result-col" id="result">
          <h2>Result</h2>
          <p className="lead" style={{ marginBottom: 12 }}>Pathway from EAACI/ENDA stratification, cross-checked against the 4 other tools.</p>
          <div className={`band ${cat || ''} ${cat === 'low' ? 'cut' : ''}`} role="status" aria-live="polite">
            <div className="clasp">{cat ? BAND[cat][2] : '?'}</div>
            <div className="txt"><strong>{bandTitle}</strong><span>{cat ? BAND[cat][1] : e.whyMissing || 'Choose the manifestations, time to onset, and the dose that triggered the reaction.'}</span></div>
          </div>
          {cat && applicable.length > 1 && <p className="agree"><b>{same}/{applicable.length}</b> applicable tools point the same way ({cat === 'low' ? 'direct challenge' : 'testing or specialist review'}).{conflict ? ' At least one tool rates this child higher: consider skin testing first.' : ''}</p>}
          <div className="ladder">
            {res.map(x => (
              <div className="rung" key={x.id}>
                <div><div className="name">{x.name}</div><div className="meta">{x.meta}</div></div>
                <span className={`tag ${x.cat || 'na'}`}>{x.cat ? LABEL[x.cat] : 'Insufficient data'}</span>
                {x.why && <div className="why">{x.why}</div>}
              </div>
            ))}
          </div>
          {c && (c.note || c.rows?.length > 0) && (
            <div className="ctx">
              <b>{c.note ? 'In the cohort' : 'Children in the cohort with the same result'}</b>
              {c.note ? <p className="bound">{c.note}</p> : <dl>{c.rows.map(r => <Fragment key={r[0]}><dt>{r[0]}</dt><dd>{r[1]}</dd></Fragment>)}</dl>}
              {!c.note && <p className="bound">{c.low ? `None of the ${D.base.eaaci.low} low-risk children was allergic, but with so few children a miss rate up to ${pc(1 - D.base.eaaci.npv.lo)} cannot be excluded.` : 'Intervals are exact 95% intervals from 38 children and are wide.'}</p>}
            </div>
          )}
          {cat && <div className="next"><b>Next steps</b><ol>{NEXT[cat].map(t => <li key={t}>{t}</li>)}</ol></div>}
          {cat && <div className="actions"><button className="btn" type="button" onClick={copy}>Copy summary</button><span className="meta" role="status" aria-live="polite">{msg}</span></div>}
        </div>
      </div>
      <div className="dock"><span className={`dot ${cat || ''}`} /><p>{bandTitle}</p><a href="#result">See details</a></div>
    </section>
  )
}
