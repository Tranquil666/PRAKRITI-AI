"""
Bake-off across multiple classifiers on ayurvedic_dosha_dataset.csv.
Picks the model with the highest macro-F1 on stratified 5-fold CV
(macro-F1 instead of accuracy because the classes are imbalanced).

Run:  python3 train_classifier.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.tree import DecisionTreeClassifier, _tree

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

REPO = Path(__file__).resolve().parent
CSV = REPO / "ayurvedic_dosha_dataset.csv"
OUT_JS = REPO / "prakriti_classifier.js"
OUT_META = REPO / "prakriti_classifier.meta.json"

UI_QUESTIONS = [
    "Body Frame", "Body Weight", "Skin", "Type of Hair",
    "Memory", "Mental Activity", "Reaction under Adverse Situations",
    "Sleep Pattern", "Body Energy", "Eating Habit", "Hunger",
    "Pace of Performing Work", "Weather Conditions", "Social Relations",
]


def load() -> pd.DataFrame:
    df = pd.read_csv(CSV)
    df.columns = [c.strip() for c in df.columns]
    return df.dropna(subset=["Dosha"])


def encode(df: pd.DataFrame, feature_cols: list[str]):
    encoders: dict[str, list[str]] = {}
    X = pd.DataFrame()
    for col in feature_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = list(le.classes_)
    y_le = LabelEncoder()
    y = y_le.fit_transform(df["Dosha"].astype(str))
    return X, y, encoders, list(y_le.classes_)


def onehot(X_int: pd.DataFrame, vocab: dict[str, list[str]]) -> tuple[np.ndarray, list[str]]:
    cats = [list(range(len(vocab[c]))) for c in X_int.columns]
    enc = OneHotEncoder(categories=cats, sparse_output=False, handle_unknown="ignore")
    Xoh = enc.fit_transform(X_int.values)
    names: list[str] = []
    for col, vals in zip(X_int.columns, cats):
        for v in vals:
            names.append(f"{col}={vocab[col][v]}")
    return Xoh, names


def candidates() -> dict[str, Any]:
    cfg: dict[str, Any] = {
        "DecisionTree": DecisionTreeClassifier(
            max_depth=8, min_samples_leaf=15,
            class_weight="balanced", random_state=42,
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=30, max_depth=8, min_samples_leaf=10,
            class_weight="balanced", n_jobs=-1, random_state=42,
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=150, max_depth=4, learning_rate=0.05, random_state=42,
        ),
        "LogReg": LogisticRegression(
            max_iter=2000, class_weight="balanced",
            solver="lbfgs", random_state=42,
        ),
    }
    if HAS_XGB:
        cfg["XGBoost"] = XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.05,
            objective="multi:softprob", eval_metric="mlogloss",
            n_jobs=-1, random_state=42,
        )
    return cfg


def evaluate_all(X_int: pd.DataFrame, Xoh: np.ndarray, y: np.ndarray) -> list[dict]:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    rows: list[dict] = []
    for name, clf in candidates().items():
        Xfit = Xoh if name == "LogReg" else X_int.values
        acc = cross_val_score(clf, Xfit, y, cv=cv, scoring="accuracy", n_jobs=-1)
        f1 = cross_val_score(clf, Xfit, y, cv=cv, scoring="f1_macro", n_jobs=-1)
        rows.append({
            "name": name,
            "accuracy_mean": float(acc.mean()),
            "accuracy_std": float(acc.std()),
            "f1_macro_mean": float(f1.mean()),
            "f1_macro_std": float(f1.std()),
        })
        print(f"  {name:18s}  acc={acc.mean():.3f}±{acc.std():.3f}  f1={f1.mean():.3f}±{f1.std():.3f}")
    return rows


def export_decision_tree(tree: DecisionTreeClassifier) -> str:
    t = tree.tree_

    def recurse(node: int, depth: int) -> str:
        ind = "  " * (depth + 1)
        if t.feature[node] != _tree.TREE_UNDEFINED:
            f = int(t.feature[node])
            th = float(t.threshold[node])
            l = recurse(t.children_left[node], depth + 1)
            r = recurse(t.children_right[node], depth + 1)
            return f"{ind}if (x[{f}] <= {th:.6f}) {{\n{l}\n{ind}}} else {{\n{r}\n{ind}}}"
        counts = t.value[node][0]
        total = counts.sum() or 1
        probs = (counts / total).tolist()
        return f"{ind}return {json.dumps(probs)};"

    return f"function classify(x) {{\n{recurse(0, 0)}\n}}"


def export_random_forest(rf: RandomForestClassifier) -> str:
    parts: list[str] = []
    for i, est in enumerate(rf.estimators_):
        body = export_decision_tree(est)
        parts.append(body.replace("function classify", f"function _t{i}"))
    avg = ", ".join([f"_t{i}(x)" for i in range(len(rf.estimators_))])
    parts.append(
        "function classify(x) {\n"
        f"  const trees = [{avg}];\n"
        "  const k = trees[0].length;\n"
        "  const out = new Array(k).fill(0);\n"
        "  for (const p of trees) for (let j = 0; j < k; j++) out[j] += p[j];\n"
        "  for (let j = 0; j < k; j++) out[j] /= trees.length;\n"
        "  return out;\n"
        "}"
    )
    return "\n\n".join(parts)


def export_logreg(clf: LogisticRegression, oh_feature_names: list[str]) -> str:
    coef = clf.coef_.tolist()
    intercept = clf.intercept_.tolist()
    return (
        f"const LR_FEATURES = {json.dumps(oh_feature_names)};\n"
        f"const LR_COEF = {json.dumps(coef)};\n"
        f"const LR_INTERCEPT = {json.dumps(intercept)};\n"
        "function classify(x) {\n"
        "  const oh = new Array(LR_FEATURES.length).fill(0);\n"
        "  for (let i = 0; i < PRAKRITI_FEATURES.length; i++) {\n"
        "    const fname = PRAKRITI_FEATURES[i];\n"
        "    const vocab = PRAKRITI_FEATURE_VOCAB[fname];\n"
        "    if (!vocab || x[i] < 0 || x[i] >= vocab.length) continue;\n"
        "    const key = fname + '=' + vocab[x[i]];\n"
        "    const idx = LR_FEATURES.indexOf(key);\n"
        "    if (idx >= 0) oh[idx] = 1;\n"
        "  }\n"
        "  const logits = LR_INTERCEPT.map((b, c) => {\n"
        "    let s = b;\n"
        "    const w = LR_COEF[c];\n"
        "    for (let j = 0; j < oh.length; j++) if (oh[j]) s += w[j];\n"
        "    return s;\n"
        "  });\n"
        "  const m = Math.max(...logits);\n"
        "  const exps = logits.map((v) => Math.exp(v - m));\n"
        "  const z = exps.reduce((a, b) => a + b, 0);\n"
        "  return exps.map((v) => v / z);\n"
        "}\n"
    )


def export_gradient_boosting(gb: GradientBoostingClassifier) -> str:
    init = gb.init_.constants_.flatten().tolist()
    n_classes = gb.n_classes_
    lr = float(gb.learning_rate)

    blocks: list[str] = []
    for est_idx, ests in enumerate(gb.estimators_):
        for c, t in enumerate(ests):
            tt = t.tree_

            def recurse(node: int, depth: int) -> str:
                ind = "  " * (depth + 1)
                if tt.feature[node] != _tree.TREE_UNDEFINED:
                    f = int(tt.feature[node])
                    th = float(tt.threshold[node])
                    l = recurse(tt.children_left[node], depth + 1)
                    r = recurse(tt.children_right[node], depth + 1)
                    return f"{ind}if (x[{f}] <= {th:.6f}) {{\n{l}\n{ind}}} else {{\n{r}\n{ind}}}"
                return f"{ind}return {float(tt.value[node][0][0]):.8f};"

            blocks.append(f"function _g{est_idx}_{c}(x) {{\n{recurse(0, 0)}\n}}")

    n_est = len(gb.estimators_)
    return (
        "\n\n".join(blocks) + "\n\n"
        f"const GB_INIT = {json.dumps(init)};\n"
        f"const GB_NCLASSES = {n_classes};\n"
        f"const GB_NESTIMATORS = {n_est};\n"
        f"const GB_LR = {lr};\n"
        "function classify(x) {\n"
        "  const logits = GB_INIT.slice();\n"
        "  for (let i = 0; i < GB_NESTIMATORS; i++) {\n"
        "    for (let c = 0; c < GB_NCLASSES; c++) {\n"
        "      const fn = (typeof window !== 'undefined' ? window : global)['_g' + i + '_' + c];\n"
        "      logits[c] += GB_LR * fn(x);\n"
        "    }\n"
        "  }\n"
        "  const m = Math.max(...logits);\n"
        "  const exps = logits.map((v) => Math.exp(v - m));\n"
        "  const z = exps.reduce((a, b) => a + b, 0);\n"
        "  return exps.map((v) => v / z);\n"
        "}\n"
    )


def main():
    df = load()
    print(f"Loaded {len(df)} rows")
    print("Class distribution:")
    print(df["Dosha"].value_counts().to_string())

    X_int, y, vocab, classes = encode(df, UI_QUESTIONS)
    Xoh, oh_names = onehot(X_int, vocab)

    print("\nCross-validated bake-off (stratified 5-fold):")
    rows = evaluate_all(X_int, Xoh, y)

    rows.sort(key=lambda r: r["f1_macro_mean"], reverse=True)
    winner = rows[0]
    print(f"\nWinner by macro-F1: {winner['name']} (f1={winner['f1_macro_mean']:.3f})")

    factory = candidates()
    final = factory[winner["name"]]
    Xfit = Xoh if winner["name"] == "LogReg" else X_int.values
    final.fit(Xfit, y)

    if winner["name"] == "DecisionTree":
        body = export_decision_tree(final)
    elif winner["name"] == "RandomForest":
        body = export_random_forest(final)
    elif winner["name"] == "LogReg":
        body = export_logreg(final, oh_names)
    elif winner["name"] == "GradientBoosting":
        body = export_gradient_boosting(final)
    elif winner["name"] == "XGBoost":
        print("XGBoost won; falling back to next-best model since XGB JS export isn't supported.")
        winner = rows[1]
        final = factory[winner["name"]]
        Xfit = Xoh if winner["name"] == "LogReg" else X_int.values
        final.fit(Xfit, y)
        if winner["name"] == "RandomForest":
            body = export_random_forest(final)
        elif winner["name"] == "DecisionTree":
            body = export_decision_tree(final)
        elif winner["name"] == "LogReg":
            body = export_logreg(final, oh_names)
        else:
            body = export_gradient_boosting(final)
    else:
        raise SystemExit(f"Unsupported winner: {winner['name']}")

    bake_off_doc = "\n".join(
        " *   " + r["name"].ljust(18) +
        f" acc={r['accuracy_mean']:.3f}\u00b1{r['accuracy_std']:.3f}" +
        f"  f1={r['f1_macro_mean']:.3f}\u00b1{r['f1_macro_std']:.3f}"
        for r in rows
    )

    js = f"""/**
 * Prakriti classifier — auto-generated by train_classifier.py.
 *
 * Source dataset: ayurvedic_dosha_dataset.csv ({len(df)} rows; classes: {', '.join(classes)})
 *
 * Bake-off across 5-fold stratified CV (sorted by macro-F1):
{bake_off_doc}
 *
 * Selected model: {winner['name']}
 *
 * Do not edit by hand. Re-run train_classifier.py after dataset changes.
 */

const PRAKRITI_FEATURE_VOCAB = {json.dumps(vocab, indent=2)};
const PRAKRITI_CLASSES = {json.dumps(classes)};
const PRAKRITI_FEATURES = {json.dumps(list(X_int.columns))};
const PRAKRITI_MODEL_NAME = {json.dumps(winner['name'])};
const PRAKRITI_MODEL_METRICS = {json.dumps({k: v for k, v in winner.items() if k != 'name'})};
const PRAKRITI_BAKEOFF = {json.dumps(rows)};

function encodePrakritiAnswer(featureName, value) {{
  const v = PRAKRITI_FEATURE_VOCAB[featureName];
  if (!v) return -1;
  const i = v.indexOf(value);
  return i < 0 ? -1 : i;
}}

{body}

function predictPrakriti(x) {{
  const probs = classify(x);
  let best = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
  const percentages = {{ vata: 0, pitta: 0, kapha: 0 }};
  PRAKRITI_CLASSES.forEach((cls, i) => {{
    const k = cls.toLowerCase();
    if (k in percentages) percentages[k] = Math.round(probs[i] * 100);
  }});
  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const constitution = sorted[0][1] - sorted[1][1] < 15
    ? `${{sorted[0][0]}}+${{sorted[1][0]}}`
    : sorted[0][0];
  const top = probs[best];
  const confidence = top > 0.7 ? "high" : top > 0.5 ? "medium" : "low";
  return {{
    percentages,
    constitution,
    confidence,
    raw: {{ probabilities: probs, classes: PRAKRITI_CLASSES }},
    model: {{ name: PRAKRITI_MODEL_NAME, metrics: PRAKRITI_MODEL_METRICS, bakeoff: PRAKRITI_BAKEOFF }},
  }};
}}

if (typeof window !== "undefined") {{
  window.PRAKRITI_FEATURE_VOCAB = PRAKRITI_FEATURE_VOCAB;
  window.PRAKRITI_FEATURES = PRAKRITI_FEATURES;
  window.PRAKRITI_CLASSES = PRAKRITI_CLASSES;
  window.PRAKRITI_MODEL_NAME = PRAKRITI_MODEL_NAME;
  window.PRAKRITI_MODEL_METRICS = PRAKRITI_MODEL_METRICS;
  window.PRAKRITI_BAKEOFF = PRAKRITI_BAKEOFF;
  window.encodePrakritiAnswer = encodePrakritiAnswer;
  window.predictPrakriti = predictPrakriti;
}}
if (typeof module !== "undefined") {{
  module.exports = {{
    PRAKRITI_FEATURE_VOCAB, PRAKRITI_FEATURES, PRAKRITI_CLASSES,
    PRAKRITI_MODEL_NAME, PRAKRITI_MODEL_METRICS, PRAKRITI_BAKEOFF,
    encodePrakritiAnswer, predictPrakriti,
  }};
}}
"""

    OUT_JS.write_text(js)
    OUT_META.write_text(json.dumps({
        "n_rows": int(len(df)),
        "features": list(X_int.columns),
        "classes": classes,
        "winner": winner,
        "all_models": rows,
    }, indent=2))

    sz = OUT_JS.stat().st_size
    print(f"\nWrote {OUT_JS.relative_to(REPO)} ({sz/1024:.1f} KB)")
    print(f"Wrote {OUT_META.relative_to(REPO)}")


if __name__ == "__main__":
    main()
