import D from '../data/cohort.json'
import { f2 } from './format'

export const emptyForm = { drug: null, sx: { urt: false, mpe: false, angio: false, sys: false, scar: false }, onset: null, dose: null, dur: null, tx: null, prior: null, mpemod: null, since: null }

export function assess(a) {
  const s = a.sx, { drug, onset, dose, dur, tx, prior, mpemod, since } = a
  const anySx = s.urt || s.mpe || s.angio || s.sys || s.scar
  const recur = prior === 'react'
  const e = { id: 'eaaci', name: 'EAACI/ENDA 2024', meta: `Guideline based; AUC ${f2(D.base.eaaci.auc)} in 38 children` }
  if (s.scar) { e.cat = 'contra'; e.why = 'Features of a severe cutaneous reaction: do not challenge, keep the label, refer to a specialist.' }
  else if (s.sys) { e.cat = 'high'; e.why = 'Systemic symptoms suggest anaphylaxis.' }
  else if (recur) { e.cat = 'high'; e.why = 'Recurrence on re-exposure to the same drug.' }
  else if (!anySx || !onset) e.cat = null
  else if ((s.urt || s.angio) && onset === 'lt1') { e.cat = 'high'; e.why = 'Urticaria or angioedema within 1 hour of the dose.' }
  else if (s.urt || s.angio) { e.cat = 'mid'; e.why = 'Urticaria or angioedema after 1 hour or at an unknown time.' }
  else if (mpemod === 'yes') { e.cat = 'mid'; e.why = 'Moderate maculopapular rash (extensive, prolonged, or needing corticosteroids).' }
  else if (onset === 'lt1' || onset === '1to6') { e.cat = 'mid'; e.why = 'Nonsevere immediate reaction.' }
  else if (onset === 'unk') { e.cat = 'mid'; e.why = 'Unknown time to onset: classified conservatively.' }
  else if (mpemod === null) { e.cat = null; e.whyMissing = 'Answer the question on moderate maculopapular rash.' }
  else { e.cat = 'low'; e.why = 'Mild rash starting after 6 hours, without severe features.' }

  const p = { id: 'pf', name: 'PEN-FAST', meta: `Developed in adults; AUC ${f2(D.base.pf.auc)} in 38 children` }
  if (!anySx || !tx || !since) p.cat = null
  else {
    const as = s.sys || s.angio || s.scar
    const sc = (since === 'le5' ? 2 : 0) + (as ? 2 : 0) + (tx === 'yes' ? 1 : 0)
    p.score = sc; p.cat = s.scar ? 'contra' : sc < 3 ? 'low' : sc === 3 ? 'mid' : 'high'
    p.why = `Total ${sc} points (F ${since === 'le5' ? 2 : 0}, A/S ${as ? 2 : 0}, T ${tx === 'yes' ? 1 : 0}).` + (drug && drug !== 'pen' ? ' Outside its validated scope: penicillins only.' : '')
  }

  const t = { id: '111', name: '1-1-1 criterion', meta: 'Applies to urticaria only' }
  if (s.scar) { t.cat = 'contra'; t.why = 'Out of scope: severe cutaneous reaction.' }
  else if (s.sys) { t.cat = 'na'; t.why = 'Out of scope: systemic symptoms.' }
  else if (!anySx) t.cat = null
  else if (!s.urt) { t.cat = 'na'; t.why = 'No urticaria, so the criterion does not apply.' }
  else if (!onset || !dose || !dur) t.cat = null
  else { const pos = onset === 'lt1' && dose === 'first' && dur === 'le1'; t.cat = pos ? 'high' : 'low'; t.why = pos ? 'All 3 met: within 1 hour, first dose, resolved within 1 day.' : 'Not all 3 conditions of 1-1-1 are met.' }

  const r = { id: 'timing', name: 'Timing rule', meta: 'Derived from 38 children; rule-out only' }
  if (s.scar) { r.cat = 'contra'; r.why = 'Severe cutaneous reaction.' }
  else if (recur) { r.cat = 'high'; r.why = 'Recurrence on re-exposure. Not evaluated in the cohort.' }
  else if (!anySx || !onset || !dose || !dur) r.cat = null
  else if (onset === 'gt6' || dose === 'later' || dur === 'gt3') {
    const why = []
    if (onset === 'gt6') why.push('onset after 6 hours')
    if (dose === 'later') why.push('appeared after several doses')
    if (dur === 'gt3') why.push('lasted more than 3 days')
    r.cat = 'low'; r.why = 'Rule-out: ' + why.join(', ') + '.'
  } else { r.cat = 'mid'; r.why = 'Not in the rule-out group, testing needed.' }

  const d = { id: 'score', name: 'Data-derived score', meta: `Derived from 38 children; corrected AUC ${f2(D.loo.corr_auc)}` }
  if (s.scar) { d.cat = 'contra'; d.why = 'Severe cutaneous reaction.' }
  else if (!anySx || !onset || !dose || !dur || !prior) d.cat = null
  else {
    const pts = (onset === 'lt1' || onset === '1to6' ? 1 : 0) + (dose === 'first' ? 1 : 0) + (prior !== 'never' ? 1 : 0) + (dur === 'le1' ? 1 : 0)
    d.score = pts; d.cat = pts <= 2 ? 'low' : pts === 3 ? 'mid' : 'high'; d.why = `${pts}/4 points.`
  }
  const triad = onset && dose && dur ? (onset === 'lt1' ? 1 : 0) + (dose === 'first' ? 1 : 0) + (dur === 'le1' ? 1 : 0) : null
  return { res: [e, p, t, r, d], e, triad, s }
}

export const NEXT = {
  low: ['Record the history in the chart before the challenge.', 'Supervised challenge on the ward with emergency drugs at hand.', 'If negative: remove the label, update the record, and counsel the family to use the drug again.'],
  mid: ['Book skin prick and intradermal tests 4–6 weeks after the acute phase.', 'Meanwhile, if a beta-lactam is needed, prefer one with a different side chain.', 'If the skin tests are negative: supervised challenge.'],
  high: ['Keep the allergy label until a specialist has assessed the child.', 'Skin test first; challenge only if benefit outweighs risk, where resuscitation is available.', 'Record the drug name and reaction type in the chart.'],
  contra: ['Record a permanent allergy label for the suspected drug.', 'Do not re-challenge.', 'Refer to an allergy specialist and identify safe alternatives.'],
}
export const BAND = {
  low: ['Low risk: direct challenge is reasonable', 'No skin test first. Supervised challenge on the ward.', '✓'],
  mid: ['Intermediate risk: skin test before challenge', 'Skin prick and intradermal tests; challenge if negative.', '!'],
  high: ['High risk: keep the label, refer to a specialist', 'Skin test first; challenge only if benefit outweighs risk, with resuscitation available.', '!!'],
  contra: ['Do not challenge: keep the label permanently', 'Suspected severe cutaneous reaction. Refer to an allergy specialist.', '×'],
}
export const EXAMPLES = {
  low: { drug: 'pen', sx: { urt: false, mpe: true, angio: false, sys: false, scar: false }, onset: 'gt6', dose: 'later', dur: '1to3', tx: 'no', prior: 'never', mpemod: 'no', since: 'le5' },
  high: { drug: 'pen', sx: { urt: true, mpe: false, angio: false, sys: false, scar: false }, onset: 'lt1', dose: 'first', dur: 'le1', tx: 'yes', prior: 'react', mpemod: 'no', since: 'le5' },
}
