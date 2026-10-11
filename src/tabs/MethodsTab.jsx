export default function MethodsTab() {
  return (
    <section className="panel active" role="tabpanel" aria-labelledby="t-methods">
      <h2>Methods and limitations</h2>
      <h3>Data</h3>
      <p className="note">38 children aged 1 month to 15 years admitted to the respiratory ward of a tertiary pediatric hospital in Vietnam with a suspected antibiotic reaction, confirmed by skin testing and/or drug provocation testing. 6 children had confirmed allergy and 32 were delabeled. Only aggregate counts are included in this repository; no patient-level data.</p>
      <h3>Reference standard</h3>
      <p className="note">Confirmed allergy was a positive skin test or a positive drug provocation test with the suspected drug. One child had a positive intradermal test (ceftriaxone), was not challenged, and is counted as allergic; the Robustness tab shows the effect of counting this child as not allergic.</p>
      <h3>Analysis</h3>
      <p className="note">Proportions use exact Clopper–Pearson intervals. AUC intervals come from stratified bootstrap (2,000 resamples). Group differences use Fisher's exact test with Haldane–Anscombe odds ratios; paired comparisons use exact McNemar tests and paired bootstrap differences in AUC. Data-derived score: predictors with P &lt; .20, Firth-penalized logistic regression, bootstrap optimism correction (500 resamples), and leave-one-out cross-validation of the whole procedure. The cross-validated estimate for the timing rule comes from an automated search for the largest rule-out rule. Decision model: 2-step decision tree with beta distributions (Jeffreys priors for cohort parameters; meta-analytic distributions for skin-test accuracy and severity), 2,000 draws, fixed seed. Results can differ by a few units from the manuscript, which used 5,000 draws.</p>
      <h3>Approximations</h3>
      <ul className="refs">
        <li>Time to onset was recorded as rapid or delayed, without a separate 1-hour mark. For the 1-1-1 criterion in the cohort, “rapid” stands in for “within 1 hour” and the rule is applied to all phenotypes, not only urticaria. The Robustness tab shows the urticaria-only result.</li>
        <li>PEN-FAST: every reaction occurred within 5 years, so every child scores 2 points for the time item; angioedema counts toward the severity item.</li>
        <li>A history of a similar reaction on re-exposure is available only for the 14 previously exposed children (4 of 4 allergic children had one, 0 of 10 delabeled children). In the bedside tool it places a child in the high-risk EAACI/ENDA category, as the guideline defines, but cohort performance estimates do not use it.</li>
        <li>Cohort risk categories were assigned by physicians using the hospital protocol; 8 of the 16 low-risk children had urticaria. The bedside questionnaire follows the guideline and can classify a child differently.</li>
        <li>Symptom duration was missing for 2 delabeled children and counted as not resolved within 1 day.</li>
        <li>Age was recorded mostly in whole years, so age in months is approximate.</li>
        <li>Not every delabeled child was followed up: 27 of 32 have follow-up data, and 7 of them received the drug again without a reaction.</li>
      </ul>
      <h3>Limitations</h3>
      <p className="note">6 events are too few to build a reliable model. All results are exploratory and need prospective multicenter validation, in which every child, including low-risk children, completes the reference standard to avoid verification bias (see the Plan a validation tab for sample sizes). Physicians performing the tests knew the EAACI/ENDA category. Challenges were not blinded or placebo-controlled, and a positive challenge included subjective and mild skin findings in children with a concurrent infection. The tool does not apply to children with anaphylaxis or severe cutaneous reactions.</p>
    </section>
  )
}
