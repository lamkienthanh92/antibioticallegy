export default function EvidenceTab() {
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-evidence">
      <h2>Inputs and evidence</h2>
      <p className="lead">The numbers used in the decision model, how each tool performed elsewhere, and the tools being compared.</p>
      <div className="tablewrap"><table>
        <thead><tr><th>Input</th><th>Value used</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>Reactions to direct penicillin challenge in children</td><td>6.6% (4.6–9.5%)</td><td>Blumenthal et al, JAMA Intern Med 2024 (56 studies, 9,225 participants)</td></tr>
          <tr><td>Severe reactions after direct challenge</td><td>5 of 9,225 participants; 4 in children among 315 reactions</td><td>Blumenthal et al, 2024</td></tr>
          <tr><td>Penicillin skin test sensitivity and specificity</td><td>30.7% (18.9–45.9) and 96.8% (94.2–98.3)</td><td>Sousa-Pinto et al, J Allergy Clin Immunol 2021</td></tr>
          <tr><td>Prevalence of true allergy in this cohort</td><td>6/38 = 15.8%</td><td>Derivation cohort</td></tr>
          <tr><td>Levofloxacin while awaiting challenge</td><td>9/36 children with a suspected beta-lactam allergy</td><td>Derivation cohort</td></tr>
        </tbody>
      </table></div>
      <h3 className="sub">This cohort against published pediatric and adult data</h3>
      <div className="tablewrap"><table>
        <thead><tr><th>Measure</th><th>Published</th><th>This cohort</th></tr></thead>
        <tbody>
          <tr><td>PEN-FAST discrimination in children</td><td>AUC about 0.53 in 2,028 Canadian children; 0.62 in 267 Thai children (Copaescu 2022; Yuenyongviwat 2026)</td><td>AUC 0.62 (0.42–0.80)</td></tr>
          <tr><td>1-1-1 criterion</td><td>Sensitivity and specificity 85% in 410 patients, mainly adults (Sabato 2021)</td><td>Sensitivity 83.3%, specificity 65.6%, approximated</td></tr>
          <tr><td>Confirmed allergy after pediatric work-up</td><td>5.2% in pooled direct challenges; 5.9% in a large Canadian cohort; 32.8% in a retrospective Vietnamese series</td><td>15.8% (6.0–31.3%)</td></tr>
          <tr><td>Skin-test sensitivity</td><td>30.7% (18.9–45.9)</td><td>1 of 3 allergic children who were skin tested had a positive test</td></tr>
        </tbody>
      </table></div>
      <p className="note" style={{ marginTop: 8 }}>Published figures are taken from the accompanying manuscript's reference list; verify them against the original articles before citing.</p>
      <h3 className="sub">Tools compared</h3>
      <ul className="refs">
        <li><b>EAACI/ENDA 2024</b>: low, intermediate, and high risk by phenotype, timing, and severity. The derivation data use the categories assigned by the treating physician.</li>
        <li><b>PEN-FAST</b>: 2 points for a reaction within 5 years, 2 points for anaphylaxis, angioedema, or a severe cutaneous reaction, and 1 point for treatment. Below 3 points is low risk. Developed in adults with penicillin allergy.</li>
        <li><b>1-1-1 criterion</b>: urticaria within 1 hour, after the first dose, and resolved within 1 day is high risk and calls for skin testing before challenge. Developed mainly in adults in Italy and Belgium.</li>
        <li><b>Timing rule</b>: delayed onset, a reaction after several doses, or symptoms lasting more than 3 days place a child in the low-risk group. Derived from the 38 children.</li>
        <li><b>Data-derived score</b>: 1 point each for rapid onset, first-dose reaction, previous exposure, and resolution within 1 day. Derived from the 38 children.</li>
      </ul>
      <div className="callout"><b>What the literature adds.</b> The timing features selected by the data match the published 1-1-1 criterion, so they are not a new finding. The value of this cohort is an independent check of 1-1-1 and EAACI/ENDA in hospitalized children in Vietnam, a population in which PEN-FAST has performed poorly.</div>
    </section>
  )
}
