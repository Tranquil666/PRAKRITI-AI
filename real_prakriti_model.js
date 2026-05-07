/**
 * Adapter that exposes the trained decision-tree classifier through the same
 * `predictDosha(responses)` interface that assessment.js expects.
 *
 * Plug it in by replacing the existing model lookup in assessment.js:
 *
 *     const model = window.realPrakritiModel
 *                 || window.enhancedDatasetPrakritiModel
 *                 || window.advancedPrakritiModel;
 *
 * Load order in index_bootstrap.html:
 *
 *     <script src="prakriti_classifier.js"></script>      <!-- generated -->
 *     <script src="real_prakriti_model.js"></script>      <!-- this file -->
 *     <script src="assessment.js"></script>
 */

(function () {
  if (typeof window === "undefined") return;

  // Map UI question index (assessment.js order) to the CSV-derived feature
  // name the classifier expects, plus a translation from the UI's three
  // multiple-choice options to a CSV vocabulary entry.
  //
  // The UI offers 0=Vata-ish, 1=Pitta-ish, 2=Kapha-ish for each question.
  // Vocab values below MUST match prakriti_classifier.meta.json exactly;
  // re-run train_classifier.py if you change the dataset.
  const UI_TO_CLASSIFIER = [
    { feature: "Body Frame",                        options: ["Thin and Lean", "Medium",            "Well Built"] },
    { feature: "Body Weight",                       options: ["Underweight",   "Normal",            "Overweight"] },
    { feature: "Skin",                              options: ["Dry,Rough",     "Soft,Sweating",     "Moist,Greasy"] },
    { feature: "Type of Hair",                      options: ["Dry",           "Normal",            "Greasy"] },
    // No CSV column for "Eyes"; we collapse it into Memory below.
    { feature: "Memory",                            options: ["Short term",    "Good Memory",       "Long Term"] },
    { feature: "Mental Activity",                   options: ["Restless",      "Aggressive",        "Stable"] },
    { feature: "Reaction under Adverse Situations", options: ["Anxiety",       "Anger",             "Calm"] },
    { feature: "Sleep Pattern",                     options: ["Less",          "Moderate",          "Sleepy"] },
    { feature: "Body Energy",                       options: ["Low",           "Medium",            "High"] },
    { feature: "Eating Habit",                      options: ["Irregular Chewing", "Proper Chewing", "Improper Chewing"] },
    { feature: "Hunger",                            options: ["Irregular",     "Sudden and Sharp",  "Skips Meal"] },
    { feature: "Pace of Performing Work",           options: ["Fast",          "Medium",            "Slow"] },
    { feature: "Weather Conditions",                options: ["Dislike Cold",  "Dislike Heat",      "Dislike Moist"] },
    { feature: "Social Relations",                  options: ["Introvert",     "Ambivert",          "Extrovert"] },
  ];

  function responsesToVector(responses) {
    return window.PRAKRITI_FEATURES.map((featureName, i) => {
      const mapping = UI_TO_CLASSIFIER.find((m) => m.feature === featureName);
      if (!mapping) return -1;
      const responseIdx = responses[i];
      const candidate = mapping.options[responseIdx];
      const encoded = window.encodePrakritiAnswer(featureName, candidate);
      return encoded;
    });
  }

  class RealPrakritiModel {
    constructor() {
      this.version = "4.0.0-real";
      this.isModelTrained = true;
      this.trainingSamples = 5000;
      this.modelKind = "decision-tree";
    }

    async predictDosha(responses) {
      if (typeof window.predictPrakriti !== "function") {
        throw new Error(
          "prakriti_classifier.js must be loaded before real_prakriti_model.js"
        );
      }
      const vec = responsesToVector(responses);
      const out = window.predictPrakriti(vec);

      return {
        percentages: out.percentages,
        constitution: out.constitution,
        confidence: out.confidence,
        analysis: {
          constitution: out.constitution,
          confidenceExplanation: explain(out),
          modelKind: "decision-tree",
          sourceRows: 5000,
        },
        datasetBased: true,
        trainingSamples: 5000,
        modelVersion: this.version,
      };
    }
  }

  function explain(out) {
    const lvl = out.confidence;
    const top = Math.max(...Object.values(out.percentages));
    return `${lvl[0].toUpperCase()}${lvl.slice(1)} confidence (top class ${top}%) from a depth-6 decision tree trained on 5,000 labelled rows.`;
  }

  window.realPrakritiModel = new RealPrakritiModel();
  console.log(`✅ Real Prakriti classifier loaded (v${window.realPrakritiModel.version})`);
})();
