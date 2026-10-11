# Beta-lactam allergy delabeling in hospitalized children: research tool (React)

React (Vite) version of the research tool that accompanies the manuscript. It includes a bedside assessment with 5 risk-stratification tools, the derivation cohort, tool comparison with exact confidence intervals, robustness checks, a probabilistic decision model, and a validation-study planner.

> **Research use only.** The tool has not been prospectively validated. Do not use it to skip allergy testing for a real patient without confirmation by an allergy specialist.

Only aggregate counts are included (`src/data/cohort.json`); there is no patient-level data.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output in dist/
```

## Deploy on Netlify

1. Push this folder to a GitHub repository (keep it private while the manuscript is under double-blind review).
2. In Netlify: *Add new site → Import an existing project*, choose the repository.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, Node 20. No other settings are needed.

Alternatively, drag the built `dist/` folder onto Netlify Drop.

## Structure

- `src/lib/` assessment rules, exact intervals, Monte Carlo model
- `src/components/Charts.jsx` all SVG charts
- `src/tabs/` one component per tab
- `src/data/cohort.json` aggregate cohort statistics

## License

MIT License. Please cite the accompanying article once published.
