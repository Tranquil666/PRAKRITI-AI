# PRAKRITI-AI

A static, client-side web app that estimates a user's Ayurvedic constitution (Prakriti) from a 15-question self-assessment and returns lifestyle and dietary suggestions for the predicted dosha.

> **Live demo:** https://prakriti-ai-bice.vercel.app
> **Status:** experimental / educational. Not a medical device.

---

## What this project actually is

- A single-page Vanilla JavaScript + Bootstrap 5 application.
- No backend. Everything (assessment, scoring, recommendations, history) runs in the browser.
- Persistence is via `localStorage` only.
- Deployed as static files on Vercel and Render.

## What this project is *not* (despite earlier README versions)

- It is not a Streamlit app. There is no `streamlit_app.py`, `prakriti_model.py`, or `requirements.txt` in this repository.
- It does not currently run a real Random Forest, Gradient Boosting, or SVM ensemble in the browser. The original `EnsembleClassifier` and `ModelEvaluator` classes referenced in `advanced_prakriti_model.js` were never implemented; the prediction path falls through to a rule-based scoring function. A real classifier is on the roadmap (see below).
- The "100% accuracy" figure that appeared in earlier docs was a placeholder, not a measured result.

## How prediction currently works

1. The user answers 15 multiple-choice questions covering body frame, skin, hair, eyes, memory, sleep, appetite, digestion, weather preference, etc. Each option is mapped to a dosha index: `0 = Vata`, `1 = Pitta`, `2 = Kapha`.
2. Responses are summed to produce three scores. Scores are normalised to percentages.
3. A primary dosha is chosen by argmax. If the top two doshas are within 20 percentage points of each other, the result is reported as a dual constitution (e.g. `vata+pitta`).
4. A confidence label is derived from the spread between scores.
5. Diet, lifestyle, and seasonal recommendations are looked up from static dictionaries keyed by the predicted constitution.

This is a deterministic, interpretable rule-based scorer with Ayurvedic feature weighting. It is not machine learning in any meaningful sense, and the README has been corrected to reflect that.

## Dataset

`ayurvedic_dosha_dataset.csv` contains 5,000 labelled rows across 25 features and a `Dosha` column. Class distribution:

| Dosha | Count |
|-------|-------|
| Kapha | 2,205 |
| Pitta | 1,835 |
| Vata  |   960 |

The dataset uses single-dosha labels only. Dual-dosha outputs (`vata+pitta`, etc.) are produced by the scoring heuristic at inference time and are not present in the training labels.

## Repository layout

```
PRAKRITI-AI/
├── index_bootstrap.html              # Single-page entry (UI + most app logic)
├── advanced_prakriti_model.js        # Rule-based scorer (the "model")
├── enhanced_dataset_model.js         # Wrapper that loads the CSV
├── enhanced_decision_tree.js         # Standalone decision-tree implementation (currently not wired into prediction)
├── ayurvedic_feature_enhancer.js     # Feature-weight helpers
├── assessment.js                     # Questionnaire rendering and submission
├── ayurvedic_dosha_dataset.csv       # Labelled dataset
├── render.yaml                       # Render static-site config
└── Dr_Prasanna_Kulkarni_Dosha_Prediction-DT_and_RF_models.ipynb
                                      # Reference notebook (Decision Tree + Random Forest research)
```

## Running locally

This is a static site, so any local web server works. From the repo root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index_bootstrap.html
```

A web server is required (not just `file://`) because `enhanced_dataset_model.js` uses `fetch()` to load the CSV.

## Deployment

`render.yaml` configures a static deploy on Render. Vercel auto-detects the same. No build step is required today.

## Roadmap

- [ ] Replace the rule-based scorer with a real classifier trained on the CSV (logistic regression or a small decision tree, exported via TensorFlow.js or hand-translated to JS).
- [ ] Move LLM calls out of the client. The Gemini API key currently lives in client-side code and must be proxied through a serverless function with the key in environment variables.
- [ ] Sanitize all `innerHTML` insertions with DOMPurify.
- [ ] Add Subresource Integrity to CDN-loaded Bootstrap and Bootstrap Icons.
- [ ] Add Content Security Policy headers via `render.yaml`.
- [ ] Add Open Graph and Twitter Card meta tags for link previews.
- [ ] Wire up the existing `service-worker.js` (currently committed but never registered) or remove it.
- [ ] Migrate the inline scripts and styles in `index_bootstrap.html` into separate modules and add a Vite build.
- [ ] Add automated tests for the scoring function.
- [ ] Audit accessibility: ARIA labels, fieldsets/legends for the radio groups, and screen-reader announcements for loading states.

## Disclaimer

This application is for educational purposes only. It does not diagnose, treat, or prevent any medical condition. Consult a qualified healthcare professional for medical concerns.

## License

MIT. See [`LICENSE`](LICENSE).

## Acknowledgements

- Decision-tree and random-forest research adapted from work by Dr. Prasanna Kulkarni (see the included notebook).
- Built with Bootstrap 5 and Bootstrap Icons.
