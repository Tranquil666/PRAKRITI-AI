/**
 * Enhanced Decision Tree Implementation
 * Based on Dr. Prasanna Kulkarni's Decision Tree and Random Forest research
 * Implements interpretable decision rules for Ayurvedic constitution analysis
 */

class EnhancedDecisionTree {
    constructor() {
        this.version = '1.0.0';
        this.maxDepth = 3; // Following Dr. Kulkarni's optimal depth
        this.minSamplesLeaf = 5;
        this.tree = null;
        
        // Key decision features based on research insights
        this.primaryFeatures = [
            'weatherPreference', // Virya (thermal preference) - primary classifier
            'digestion',         // Agni strength - crucial for classification
            'bodyFrame',         // Physical constitution indicator
            'energy',            // Vital energy patterns
            'stressResponse'     // Mental constitution
        ];
    }
    
    /**
     * Build decision tree using traditional Ayurvedic principles
     */
    buildTree(trainingData) {
        console.log('🌳 Building Enhanced Decision Tree with Ayurvedic principles...');
        
        this.tree = this.buildNode(trainingData, 0);
        return this.tree;
    }
    
    /**
     * Build individual tree node
     */
    buildNode(data, depth) {
        // Stop conditions
        if (depth >= this.maxDepth || data.length < this.minSamplesLeaf * 2) {
            return this.createLeafNode(data);
        }
        
        // Find best split using Ayurvedic-informed feature selection
        const bestSplit = this.findBestSplit(data);
        
        if (!bestSplit) {
            return this.createLeafNode(data);
        }
        
        // Split data
        const leftData = data.filter(sample => 
            this.evaluateCondition(sample, bestSplit.feature, bestSplit.threshold, '<=')
        );
        const rightData = data.filter(sample => 
            this.evaluateCondition(sample, bestSplit.feature, bestSplit.threshold, '>')
        );
        
        return {
            type: 'internal',
            feature: bestSplit.feature,
            threshold: bestSplit.threshold,
            condition: bestSplit.condition,
            gini: bestSplit.gini,
            samples: data.length,
            left: this.buildNode(leftData, depth + 1),
            right: this.buildNode(rightData, depth + 1),
            ayurvedicRule: this.generateAyurvedicRule(bestSplit)
        };
    }
    
    /**
     * Find best split using Ayurvedic-informed criteria
     */
    findBestSplit(data) {
        let bestSplit = null;
        let bestGini = Infinity;
        
        // Prioritize traditional Ayurvedic features
        const features = [...this.primaryFeatures, ...Object.keys(data[0].features || {})];
        
        for (const feature of features) {
            const values = data.map(sample => this.getFeatureValue(sample, feature))
                              .filter(val => val !== undefined);
            
            if (values.length === 0) continue;
            
            // Try different thresholds
            const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
            
            for (let i = 0; i < uniqueValues.length - 1; i++) {
                const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
                const gini = this.calculateSplitGini(data, feature, threshold);
                
                // Apply Ayurvedic feature weighting
                const weightedGini = gini * this.getFeatureWeight(feature);
                
                if (weightedGini < bestGini) {
                    bestGini = weightedGini;
                    bestSplit = {
                        feature,
                        threshold,
                        gini: weightedGini,
                        condition: this.generateCondition(feature, threshold)
                    };
                }
            }
        }
        
        return bestSplit;
    }
    
    /**
     * Calculate Gini impurity for a split
     */
    calculateSplitGini(data, feature, threshold) {
        const leftData = data.filter(sample => 
            this.getFeatureValue(sample, feature) <= threshold
        );
        const rightData = data.filter(sample => 
            this.getFeatureValue(sample, feature) > threshold
        );
        
        const totalSamples = data.length;
        const leftWeight = leftData.length / totalSamples;
        const rightWeight = rightData.length / totalSamples;
        
        return leftWeight * this.calculateGini(leftData) + 
               rightWeight * this.calculateGini(rightData);
    }
    
    /**
     * Calculate Gini impurity for a dataset
     */
    calculateGini(data) {
        if (data.length === 0) return 0;
        
        const classCounts = {};
        data.forEach(sample => {
            const label = sample.constitution || sample.primaryDosha;
            classCounts[label] = (classCounts[label] || 0) + 1;
        });
        
        let gini = 1;
        const total = data.length;
        
        Object.values(classCounts).forEach(count => {
            const probability = count / total;
            gini -= probability * probability;
        });
        
        return gini;
    }
    
    /**
     * Create leaf node with prediction
     */
    createLeafNode(data) {
        const classCounts = {};
        data.forEach(sample => {
            const label = sample.constitution || sample.primaryDosha;
            classCounts[label] = (classCounts[label] || 0) + 1;
        });
        
        // Find majority class
        const majorityClass = Object.keys(classCounts).reduce((a, b) => 
            classCounts[a] > classCounts[b] ? a : b
        );
        
        // Calculate confidence
        const confidence = classCounts[majorityClass] / data.length;
        
        return {
            type: 'leaf',
            prediction: majorityClass,
            confidence,
            samples: data.length,
            distribution: classCounts,
            gini: this.calculateGini(data)
        };
    }
    
    /**
     * Get feature value from sample
     */
    getFeatureValue(sample, feature) {
        if (sample.features && sample.features[feature] !== undefined) {
            return sample.features[feature];
        }
        
        // Map traditional feature names to response indices
        const featureMap = {
            'bodyFrame': 0, 'bodyWeight': 1, 'skin': 2, 'hair': 3, 'eyes': 4,
            'memory': 5, 'decisionMaking': 6, 'stressResponse': 7, 'sleep': 8,
            'energy': 9, 'appetite': 10, 'digestion': 11, 'activityLevel': 12,
            'weatherPreference': 13, 'communication': 14
        };
        
        const index = featureMap[feature];
        return index !== undefined ? sample.responses[index] : undefined;
    }
    
    /**
     * Get feature importance weight based on Ayurvedic principles
     */
    getFeatureWeight(feature) {
        const weights = {
            'weatherPreference': 0.8,  // Virya - thermal preference (key classifier)
            'digestion': 0.8,          // Agni - digestive fire
            'bodyFrame': 0.9,          // Physical constitution
            'energy': 0.9,             // Vital energy
            'stressResponse': 0.9,     // Mental constitution
            'appetite': 0.95,          // Related to Agni
            'sleep': 0.95,             // Fundamental for balance
            'skin': 1.0,               // Physical manifestation
            'hair': 1.1,               // Secondary trait
            'eyes': 1.2                // Tertiary trait
        };
        
        return weights[feature] || 1.0;
    }
    
    /**
     * Generate human-readable condition
     */
    generateCondition(feature, threshold) {
        const featureNames = {
            'weatherPreference': 'Weather Preference',
            'digestion': 'Digestive Strength',
            'bodyFrame': 'Body Frame',
            'energy': 'Energy Level',
            'stressResponse': 'Stress Response'
        };
        
        const readableName = featureNames[feature] || feature;
        return `${readableName} <= ${threshold.toFixed(2)}`;
    }
    
    /**
     * Generate Ayurvedic rule explanation
     */
    generateAyurvedicRule(split) {
        const rules = {
            'weatherPreference': {
                low: 'Prefers warmth → Vata/Kapha tendency (cold constitution)',
                high: 'Prefers coolness → Pitta tendency (hot constitution)'
            },
            'digestion': {
                low: 'Weak digestion → Vata/Kapha (low Agni)',
                high: 'Strong digestion → Pitta (strong Agni)'
            },
            'bodyFrame': {
                low: 'Light frame → Vata tendency',
                high: 'Heavy frame → Kapha tendency'
            },
            'energy': {
                low: 'Variable energy → Vata tendency',
                high: 'Steady energy → Kapha tendency'
            }
        };
        
        const featureRules = rules[split.feature];
        if (featureRules) {
            return {
                left: featureRules.low,
                right: featureRules.high,
                principle: this.getAyurvedicPrinciple(split.feature)
            };
        }
        
        return null;
    }
    
    /**
     * Get underlying Ayurvedic principle
     */
    getAyurvedicPrinciple(feature) {
        const principles = {
            'weatherPreference': 'Virya (thermal potency) - fundamental constitutional indicator',
            'digestion': 'Agni (digestive fire) - key to health and constitution',
            'bodyFrame': 'Physical manifestation of dosha predominance',
            'energy': 'Ojas (vital energy) patterns reflect constitution',
            'stressResponse': 'Mental constitution (Sattva, Rajas, Tamas)'
        };
        
        return principles[feature] || 'Traditional Ayurvedic constitutional indicator';
    }
    
    /**
     * Evaluate condition for sample
     */
    evaluateCondition(sample, feature, threshold, operator) {
        const value = this.getFeatureValue(sample, feature);
        if (value === undefined) return false;
        
        switch (operator) {
            case '<=': return value <= threshold;
            case '>': return value > threshold;
            case '==': return value === threshold;
            default: return false;
        }
    }
    
    /**
     * Make prediction using the tree
     */
    predict(sample) {
        if (!this.tree) {
            throw new Error('Tree not trained. Call buildTree() first.');
        }
        
        return this.traverseTree(sample, this.tree);
    }
    
    /**
     * Traverse tree to make prediction
     */
    traverseTree(sample, node) {
        if (node.type === 'leaf') {
            return {
                prediction: node.prediction,
                confidence: node.confidence,
                path: [],
                ayurvedicExplanation: this.generateExplanation(node)
            };
        }
        
        const featureValue = this.getFeatureValue(sample, node.feature);
        const goLeft = featureValue <= node.threshold;
        
        const childResult = this.traverseTree(sample, goLeft ? node.left : node.right);
        
        // Add current decision to path
        childResult.path.unshift({
            feature: node.feature,
            condition: node.condition,
            value: featureValue,
            decision: goLeft ? 'left' : 'right',
            ayurvedicRule: node.ayurvedicRule
        });
        
        return childResult;
    }
    
    /**
     * Generate explanation for prediction
     */
    generateExplanation(leafNode) {
        const distribution = leafNode.distribution;
        const total = leafNode.samples;
        
        let explanation = `Prediction: ${leafNode.prediction} (${(leafNode.confidence * 100).toFixed(1)}% confidence)\n`;
        explanation += `Based on ${total} similar cases:\n`;
        
        Object.entries(distribution).forEach(([dosha, count]) => {
            const percentage = (count / total * 100).toFixed(1);
            explanation += `  ${dosha}: ${count} cases (${percentage}%)\n`;
        });
        
        return explanation;
    }
    
    /**
     * Get tree visualization
     */
    visualizeTree() {
        if (!this.tree) return 'Tree not trained';
        
        return this.visualizeNode(this.tree, 0);
    }
    
    /**
     * Visualize individual node
     */
    visualizeNode(node, depth) {
        const indent = '  '.repeat(depth);
        
        if (node.type === 'leaf') {
            return `${indent}→ ${node.prediction} (${node.samples} samples, ${(node.confidence * 100).toFixed(1)}% confidence)`;
        }
        
        let result = `${indent}${node.condition} (gini=${node.gini.toFixed(3)}, samples=${node.samples})\n`;
        
        if (node.ayurvedicRule) {
            result += `${indent}  Ayurvedic Rule: ${node.ayurvedicRule.principle}\n`;
        }
        
        result += `${indent}├─ True: ${this.visualizeNode(node.left, depth + 1)}\n`;
        result += `${indent}└─ False: ${this.visualizeNode(node.right, depth + 1)}`;
        
        return result;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.EnhancedDecisionTree = EnhancedDecisionTree;
}

console.log('🌳 Enhanced Decision Tree loaded - Dr. Kulkarni\'s research principles integrated');
