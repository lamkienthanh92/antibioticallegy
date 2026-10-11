import { useRef, useState } from 'react'
import AssessTab from './tabs/AssessTab.jsx'
import CohortTab from './tabs/CohortTab.jsx'
import CompareTab from './tabs/CompareTab.jsx'
import RobustTab from './tabs/RobustTab.jsx'
import SimTab from './tabs/SimTab.jsx'
import PlanTab from './tabs/PlanTab.jsx'
import EvidenceTab from './tabs/EvidenceTab.jsx'
import MethodsTab from './tabs/MethodsTab.jsx'
import { emptyForm } from './lib/assess'

const TABS = [
  ['assess', 'Assess a child'], ['cohort', 'Cohort'], ['models', 'Compare tools'], ['robust', 'Robustness'],
  ['sim', 'Decision model'], ['plan', 'Plan a validation'], ['evidence', 'Evidence'], ['methods', 'Methods and limitations'],
]

export default function App() {
  const [tab, setTab] = useState('assess')
  const [form, setForm] = useState(emptyForm)
  const refs = useRef({})
  const go = id => { setTab(id); window.scrollTo({ top: 0 }) }
  const onKey = (e, i) => {
    let j = -1
    if (e.key === 'ArrowRight') j = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length
    if (j >= 0) { e.preventDefault(); refs.current[TABS[j][0]]?.focus(); go(TABS[j][0]) }
  }
  return (
    <>
      <header className="top"><div className="wrap">
        <h1>Beta-lactam allergy delabeling in hospitalized children</h1>
        <p>Take the reaction history at the bedside, compare 5 risk-stratification tools, explore the 38-child derivation cohort with exact confidence intervals, test how robust the findings are, and model the effect of each testing strategy per 1,000 children.</p>
        <div className="notice">Research tool, not prospectively validated. Do not use it to skip testing for a real patient without confirmation by an allergy specialist.</div>
      </div></header>
      <nav className="tabs" aria-label="Sections"><div className="wrap" role="tablist">
        {TABS.map(([id, t], i) => (
          <button key={id} id={`t-${id}`} role="tab" ref={el => (refs.current[id] = el)} aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => go(id)} onKeyDown={e => onKey(e, i)}>{t}</button>
        ))}
      </div></nav>
      <main className="wrap">
        {tab === 'assess' && <AssessTab form={form} setForm={setForm} />}
        {tab === 'cohort' && <CohortTab />}
        {tab === 'models' && <CompareTab />}
        {tab === 'robust' && <RobustTab />}
        {tab === 'sim' && <SimTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'evidence' && <EvidenceTab />}
        {tab === 'methods' && <MethodsTab />}
      </main>
      <footer><div className="wrap">Research tool accompanying a manuscript under review. Not a substitute for evaluation by an allergy specialist. Released under the MIT License.</div></footer>
    </>
  )
}
