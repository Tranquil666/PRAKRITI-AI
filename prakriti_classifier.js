/**
 * Prakriti classifier — auto-generated from train_classifier.py
 *
 * Source dataset: ayurvedic_dosha_dataset.csv (5000 rows)
 * Model:          DecisionTreeClassifier(max_depth=6, min_samples_leaf=20, class_weight='balanced')
 * 5-fold CV acc:  decision tree 0.616 ± 0.009
 *                 random forest 0.639 ± 0.010
 *
 * Do not edit by hand; re-run train_classifier.py to regenerate.
 */

// Feature-value vocabularies. Index into these to turn UI answers into integers.
const PRAKRITI_FEATURE_VOCAB = {
  "Body Frame": [
    "Medium",
    "Thin and Lean",
    "Well Built"
  ],
  "Body Weight": [
    "Normal",
    "Overweight",
    "Underweight"
  ],
  "Skin": [
    "Dry,Rough",
    "Moist,Greasy",
    "Soft,Sweating"
  ],
  "Type of Hair": [
    "Dry",
    "Greasy",
    "Normal"
  ],
  "Memory": [
    "Good Memory",
    "Long Term",
    "Short term"
  ],
  "Mental Activity": [
    "Aggressive",
    "Restless",
    "Stable"
  ],
  "Reaction under Adverse Situations": [
    "Anger",
    "Anxiety",
    "Calm"
  ],
  "Sleep Pattern": [
    "Less",
    "Moderate",
    "Sleepy"
  ],
  "Body Energy": [
    "High",
    "Low",
    "Medium"
  ],
  "Eating Habit": [
    "Improper Chewing",
    "Irregular Chewing",
    "Proper Chewing"
  ],
  "Hunger": [
    "Irregular",
    "Skips Meal",
    "Sudden and Sharp"
  ],
  "Pace of Performing Work": [
    "Fast",
    "Medium",
    "Slow"
  ],
  "Weather Conditions": [
    "Dislike Cold",
    "Dislike Heat",
    "Dislike Moist"
  ],
  "Social Relations": [
    "Ambivert",
    "Extrovert",
    "Introvert"
  ]
};

// Class index -> label
const PRAKRITI_CLASSES = ["Kapha", "Pitta", "Vata"];

// Feature column order. UI answers must arrive in this order.
const PRAKRITI_FEATURES = ["Body Frame", "Body Weight", "Skin", "Type of Hair", "Memory", "Mental Activity", "Reaction under Adverse Situations", "Sleep Pattern", "Body Energy", "Eating Habit", "Hunger", "Pace of Performing Work", "Weather Conditions", "Social Relations"];

/**
 * Encode a UI answer for a single feature. Returns -1 if the value is unknown,
 * which the tree handles by branching to the majority side.
 */
function encodePrakritiAnswer(featureName, value) {
  const vocab = PRAKRITI_FEATURE_VOCAB[featureName];
  if (!vocab) return -1;
  const i = vocab.indexOf(value);
  return i < 0 ? -1 : i;
}

/**
 * Score a feature vector and return { probabilities, primary, confidence }.
 * `x` is an Int array aligned with PRAKRITI_FEATURES.
 */
function predictPrakriti(x) {
  function classify(x) {
  if (x[11] <= 1.500000) {
    if (x[8] <= 1.500000) {
      if (x[0] <= 0.500000) {
        if (x[10] <= 0.500000) {
          if (x[3] <= 0.500000) {
            if (x[12] <= 1.500000) {
              return [0.10616537037309073, 0.22325102066875413, 0.6705836089581552];
            } else {
              return [0.2772454508062385, 0.2818942950872067, 0.44086025410655477];
            }
          } else {
            if (x[5] <= 0.500000) {
              return [0.18889425926476974, 0.6809457902105999, 0.1301599505246304];
            } else {
              return [0.32574876874216324, 0.48353251279390497, 0.19071871846393185];
            }
          }
        } else {
          if (x[3] <= 0.500000) {
            if (x[5] <= 1.500000) {
              return [0.23476144547003758, 0.6394210923483641, 0.12581746218159823];
            } else {
              return [0.49501570106851567, 0.2775864612531349, 0.22739783767834937];
            }
          } else {
            if (x[5] <= 1.500000) {
              return [0.06714156671278476, 0.9328584332872152, 0.0];
            } else {
              return [0.2557092921398939, 0.6539318954933647, 0.09035881236674133];
            }
          }
        }
      } else {
        if (x[10] <= 0.500000) {
          if (x[3] <= 0.500000) {
            if (x[5] <= 1.500000) {
              return [0.12673267326732662, 0.0, 0.8732673267326735];
            } else {
              return [0.24977484238967262, 0.0, 0.7502251576103274];
            }
          } else {
            if (x[0] <= 1.500000) {
              return [0.30339865483065137, 0.2156637327694407, 0.48093761239990795];
            } else {
              return [0.21382234148402232, 0.16459987041777088, 0.6215777880982067];
            }
          }
        } else {
          if (x[3] <= 0.500000) {
            if (x[2] <= 1.500000) {
              return [0.2533081693178755, 0.16487462928012916, 0.5818172014019954];
            } else {
              return [0.4006361278476506, 0.292626836768992, 0.3067370353833573];
            }
          } else {
            if (x[5] <= 1.500000) {
              return [0.3677847063793236, 0.4518742323641009, 0.18034106125657556];
            } else {
              return [0.5897525226370376, 0.1602937714796857, 0.24995370588327673];
            }
          }
        }
      }
    } else {
      if (x[0] <= 0.500000) {
        if (x[10] <= 0.500000) {
          if (x[3] <= 0.500000) {
            return [0.345575659044179, 0.588278999966896, 0.0661453409889249];
          } else {
            if (x[5] <= 1.500000) {
              return [0.0, 1.0, 0.0];
            } else {
              return [0.0648524474288744, 0.9351475525711256, 0.0];
            }
          }
        } else {
          if (x[5] <= 1.500000) {
            return [0.0, 1.0, 0.0];
          } else {
            if (x[12] <= 1.500000) {
              return [0.03698851038097157, 0.9630114896190285, 0.0];
            } else {
              return [0.10655476480762147, 0.832259491338002, 0.06118574385437639];
            }
          }
        }
      } else {
        if (x[3] <= 0.500000) {
          if (x[10] <= 0.500000) {
            if (x[7] <= 1.500000) {
              return [0.2194833579568815, 0.2498578654039475, 0.5306587766391709];
            } else {
              return [0.026194756587722547, 0.25181226496317477, 0.7219929784491027];
            }
          } else {
            if (x[1] <= 1.500000) {
              return [0.4274985816989797, 0.42625938353763937, 0.1462420347633809];
            } else {
              return [0.26224676071434555, 0.6775184364340782, 0.060234802851576265];
            }
          }
        } else {
          if (x[5] <= 1.500000) {
            if (x[10] <= 0.500000) {
              return [0.20650437609728353, 0.7444285819528771, 0.04906704194983947];
            } else {
              return [0.039380640176837456, 0.9606193598231626, 0.0];
            }
          } else {
            if (x[0] <= 1.500000) {
              return [0.45665994828357226, 0.4267966274148911, 0.11654342430153661];
            } else {
              return [0.21583970079442016, 0.6354332553769245, 0.14872704382865518];
            }
          }
        }
      }
    }
  } else {
    if (x[10] <= 0.500000) {
      if (x[5] <= 1.500000) {
        if (x[3] <= 0.500000) {
          if (x[12] <= 0.500000) {
            return [0.31627906976744186, 0.0, 0.6837209302325582];
          } else {
            if (x[4] <= 1.500000) {
              return [0.18731707317073154, 0.0, 0.8126829268292685];
            } else {
              return [0.09460458240946043, 0.0, 0.9053954175905395];
            }
          }
        } else {
          if (x[2] <= 0.500000) {
            if (x[12] <= 1.500000) {
              return [0.43808591475669656, 0.09959284327667146, 0.4623212419666319];
            } else {
              return [0.7586986588986347, 0.08287988817792866, 0.15842145292343657];
            }
          } else {
            if (x[12] <= 1.500000) {
              return [0.40223688056598583, 0.06621121433675473, 0.5315519050972595];
            } else {
              return [0.22827708530748103, 0.16001166265762806, 0.611711252034891];
            }
          }
        }
      } else {
        if (x[8] <= 0.500000) {
          if (x[3] <= 0.500000) {
            return [0.5968184311574327, 0.0, 0.40318156884256723];
          } else {
            return [0.40032635300516717, 0.0, 0.5996736469948327];
          }
        } else {
          if (x[8] <= 1.500000) {
            if (x[0] <= 0.500000) {
              return [0.5663716814159291, 0.0, 0.43362831858407086];
            } else {
              return [0.9142857142857144, 0.0, 0.08571428571428567];
            }
          } else {
            if (x[2] <= 0.500000) {
              return [0.6985639641726749, 0.13253981422636585, 0.16889622160095927];
            } else {
              return [0.42839112576693833, 0.02059078871533731, 0.5510180855177244];
            }
          }
        }
      }
    } else {
      if (x[0] <= 0.500000) {
        if (x[8] <= 1.500000) {
          if (x[1] <= 0.500000) {
            if (x[10] <= 1.500000) {
              return [0.40543545379009044, 0.04428958016384194, 0.5502749660460675];
            } else {
              return [0.6252240421642917, 0.05565118631435113, 0.3191247715213572];
            }
          } else {
            if (x[1] <= 1.500000) {
              return [0.6685793920091339, 0.12105851333045818, 0.21036209466040795];
            } else {
              return [0.4889265057366851, 0.12925245118957263, 0.3818210430737422];
            }
          }
        } else {
          if (x[5] <= 1.500000) {
            if (x[13] <= 1.500000) {
              return [0.2775923828842671, 0.6064812526725873, 0.11592636444314568];
            } else {
              return [0.25424866315948996, 0.35643307137754104, 0.38931826546296894];
            }
          } else {
            if (x[2] <= 0.500000) {
              return [0.5040243507886935, 0.13976613206737404, 0.35620951714393245];
            } else {
              return [0.6581299560088543, 0.03954159544957832, 0.3023284485415675];
            }
          }
        }
      } else {
        if (x[4] <= 0.500000) {
          if (x[13] <= 0.500000) {
            if (x[5] <= 1.500000) {
              return [0.4238697423450168, 0.05457178562888839, 0.5215584720260948];
            } else {
              return [0.6936223426427678, 0.0, 0.30637765735723216];
            }
          } else {
            if (x[6] <= 0.500000) {
              return [0.9046739339002019, 0.019765231847906302, 0.0755608342518918];
            } else {
              return [0.7116588159425535, 0.009717659704937638, 0.2786235243525088];
            }
          }
        } else {
          if (x[5] <= 1.500000) {
            if (x[3] <= 0.500000) {
              return [0.5029738801775229, 0.043170782631040745, 0.45385533719143656];
            } else {
              return [0.657923937668004, 0.0416097026404117, 0.3004663596915843];
            }
          } else {
            if (x[9] <= 0.500000) {
              return [0.6068563092633115, 0.0, 0.3931436907366884];
            } else {
              return [0.4178529380284705, 0.0, 0.5821470619715294];
            }
          }
        }
      }
    }
  }
  }
  const probs = classify(x);
  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

  // Map to { vata, pitta, kapha } percentages for downstream UI compatibility.
  const percentages = { vata: 0, pitta: 0, kapha: 0 };
  PRAKRITI_CLASSES.forEach((cls, i) => {
    const key = cls.toLowerCase();
    if (key in percentages) percentages[key] = Math.round(probs[i] * 100);
  });

  // Dual-dosha label if top two are within 15 percentage points.
  const sorted = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const constitution =
    sorted[0][1] - sorted[1][1] < 15
      ? `${sorted[0][0]}+${sorted[1][0]}`
      : sorted[0][0];

  const top = probs[bestIdx];
  const confidence = top > 0.7 ? "high" : top > 0.5 ? "medium" : "low";

  return {
    percentages,
    constitution,
    confidence,
    raw: { probabilities: probs, classes: PRAKRITI_CLASSES },
  };
}

if (typeof window !== "undefined") {
  window.PRAKRITI_FEATURE_VOCAB = PRAKRITI_FEATURE_VOCAB;
  window.PRAKRITI_FEATURES = PRAKRITI_FEATURES;
  window.PRAKRITI_CLASSES = PRAKRITI_CLASSES;
  window.encodePrakritiAnswer = encodePrakritiAnswer;
  window.predictPrakriti = predictPrakriti;
}
if (typeof module !== "undefined") {
  module.exports = {
    PRAKRITI_FEATURE_VOCAB,
    PRAKRITI_FEATURES,
    PRAKRITI_CLASSES,
    encodePrakritiAnswer,
    predictPrakriti,
  };
}
