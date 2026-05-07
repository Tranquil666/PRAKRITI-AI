"""
Train a real classifier on ayurvedic_dosha_dataset.csv and export it as a
self-contained JavaScript inference function.

Output: prakriti_classifier.js  (no runtime deps, ~few KB)

Run:  python3 train_classifier.py
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier, _tree

REPO = Path(__file__).resolve().parent
CSV = REPO / "ayurvedic_dosha_dataset.csv"
OUT_JS = REPO / "prakriti_classifier.js"
OUT_META = REPO / "prakriti_classifier.meta.json"

# The 15 questions the UI actually asks. Each maps to one or more CSV columns.
# Order MUST match assessment.js / advanced_prakriti_model.js feature order.
UI_QUESTIONS = [
    "Body Frame",
    "Body Weight",
    "Skin",
    "Type of Hair",
    # Eyes is not directly in the CSV; closest proxies are skipped here.
    # We use what we have and let the tree weight accordingly.
    "Memory",
    "Mental Activity",
    "Reaction under Adverse Situations",
    "Sleep Pattern",
    "Body Energy",
    "Eating Habit",
    "Hunger",
    "Pace of Performing Work",
    "Weather Conditions",
    "Social Relations",
]


def load():
    df = pd.read_csv(CSV)
    df.columns = [c.strip() for c in df.columns]
    df = df.dropna(subset=["Dosha"])
    return df


def encode(df, feature_cols):
    encoders = {}
    X = pd.DataFrame()
    for col in feature_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = list(le.classes_)
    y_le = LabelEncoder()
    y = y_le.fit_transform(df["Dosha"].astype(str))
    return X, y, encoders, list(y_le.classes_)


def evaluate(X, y, n_classes):
    # Honest evaluation: stratified 5-fold CV on a small, regularised tree.
    tree = DecisionTreeClassifier(
        max_depth=6,
        min_samples_leaf=20,
        class_weight="balanced",
        random_state=42,
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(tree, X, y, cv=cv, scoring="accuracy")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    rf_scores = cross_val_score(rf, X, y, cv=cv, scoring="accuracy")
    return {
        "decision_tree_cv_accuracy_mean": float(scores.mean()),
        "decision_tree_cv_accuracy_std": float(scores.std()),
        "random_forest_cv_accuracy_mean": float(rf_scores.mean()),
        "random_forest_cv_accuracy_std": float(rf_scores.std()),
    }


def tree_to_js(tree: DecisionTreeClassifier, feature_names, class_names):
    """Emit a pure-JS function that takes an encoded feature vector and
    returns class probabilities."""
    t = tree.tree_

    def recurse(node, depth):
        indent = "  " * (depth + 1)
        if t.feature[node] != _tree.TREE_UNDEFINED:
            feat_idx = int(t.feature[node])
            thresh = float(t.threshold[node])
            left = recurse(t.children_left[node], depth + 1)
            right = recurse(t.children_right[node], depth + 1)
            return (
                f"{indent}if (x[{feat_idx}] <= {thresh:.6f}) {{\n"
                f"{left}\n"
                f"{indent}}} else {{\n"
                f"{right}\n"
                f"{indent}}}"
            )
        # Leaf: emit class probabilities from the training counts.
        counts = t.value[node][0]
        total = counts.sum() or 1
        probs = (counts / total).tolist()
        return f"{indent}return {json.dumps(probs)};"

    body = recurse(0, 0)
    return body


def main():
    df = load()
    print(f"Loaded {len(df)} rows")
    print("Class distribution:")
    print(df["Dosha"].value_counts())

    X, y, encoders, class_names = encode(df, UI_QUESTIONS)
    print(f"Features: {list(X.columns)}")
    print(f"Classes: {class_names}")

    metrics = evaluate(X, y, len(class_names))
    print("Cross-validated accuracy:")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}")

    # Train final tree on all data for deployment.
    tree = DecisionTreeClassifier(
        max_depth=6,
        min_samples_leaf=20,
        class_weight="balanced",
        random_state=42,
    )
    tree.fit(X, y)

    js_body = tree_to_js(tree, list(X.columns), class_names)

    js = f"""/**
 * Prakriti classifier — auto-generated from train_classifier.py
 *
 * Source dataset: ayurvedic_dosha_dataset.csv ({len(df)} rows)
 * Model:          DecisionTreeClassifier(max_depth=6, min_samples_leaf=20, class_weight='balanced')
 * 5-fold CV acc:  decision tree {metrics['decision_tree_cv_accuracy_mean']:.3f} ± {metrics['decision_tree_cv_accuracy_std']:.3f}
 *                 random forest {metrics['random_forest_cv_accuracy_mean']:.3f} ± {metrics['random_forest_cv_accuracy_std']:.3f}
 *
 * Do not edit by hand; re-run train_classifier.py to regenerate.
 */

// Feature-value vocabularies. Index into these to turn UI answers into integers.
const PRAKRITI_FEATURE_VOCAB = {json.dumps(encoders, indent=2)};

// Class index -> label
const PRAKRITI_CLASSES = {json.dumps(class_names)};

// Feature column order. UI answers must arrive in this order.
const PRAKRITI_FEATURES = {json.dumps(list(X.columns))};

/**
 * Encode a UI answer for a single feature. Returns -1 if the value is unknown,
 * which the tree handles by branching to the majority side.
 */
function encodePrakritiAnswer(featureName, value) {{
  const vocab = PRAKRITI_FEATURE_VOCAB[featureName];
  if (!vocab) return -1;
  const i = vocab.indexOf(value);
  return i < 0 ? -1 : i;
}}

/**
 * Score a feature vector and return {{ probabilities, primary, confidence }}.
 * `x` is an Int array aligned with PRAKRITI_FEATURES.
 */
function predictPrakriti(x) {{
  function classify(x) {{
{js_body}
  }}
  const probs = classify(x);
  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

  // Map to {{ vata, pitta, kapha }} percentages for downstream UI compatibility.
  const percentages = {{ vata: 0, pitta: 0, kapha: 0 }};
  PRAKRITI_CLASSES.forEach((cls, i) => {{
    const key = cls.toLowerCase();
    if (key in percentages) percentages[key] = Math.round(probs[i] * 100);
  }});

  // Dual-dosha label if top two are within 15 percentage points.
  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const constitution =
    sorted[0][1] - sorted[1][1] < 15
      ? `${{sorted[0][0]}}+${{sorted[1][0]}}`
      : sorted[0][0];

  const top = probs[bestIdx];
  const confidence = top > 0.7 ? "high" : top > 0.5 ? "medium" : "low";

  return {{
    percentages,
    constitution,
    confidence,
    raw: {{ probabilities: probs, classes: PRAKRITI_CLASSES }},
  }};
}}

if (typeof window !== "undefined") {{
  window.PRAKRITI_FEATURE_VOCAB = PRAKRITI_FEATURE_VOCAB;
  window.PRAKRITI_FEATURES = PRAKRITI_FEATURES;
  window.PRAKRITI_CLASSES = PRAKRITI_CLASSES;
  window.encodePrakritiAnswer = encodePrakritiAnswer;
  window.predictPrakriti = predictPrakriti;
}}
if (typeof module !== "undefined") {{
  module.exports = {{
    PRAKRITI_FEATURE_VOCAB,
    PRAKRITI_FEATURES,
    PRAKRITI_CLASSES,
    encodePrakritiAnswer,
    predictPrakriti,
  }};
}}
"""

    OUT_JS.write_text(js)
    OUT_META.write_text(json.dumps({
        "n_rows": int(len(df)),
        "features": list(X.columns),
        "classes": class_names,
        "metrics": metrics,
    }, indent=2))
    print(f"\nWrote {OUT_JS.relative_to(REPO)} ({OUT_JS.stat().st_size} bytes)")
    print(f"Wrote {OUT_META.relative_to(REPO)}")


if __name__ == "__main__":
    main()
