/**
 * Ayurvedic Feature Enhancer - Inspired by Dr. Prasanna Kulkarni's Research
 * Adds traditional Ayurvedic principles to modern ML feature engineering
 */

class AyurvedicFeatureEnhancer {
    constructor() {
        this.version = '1.0.0';
        
        // Traditional Ayurvedic feature mappings inspired by Dr. Kulkarni's research
        this.ayurvedicFeatures = {
            // Rasa (Taste) - influences doshas directly
            rasa: {
                madhura: { vata: -1, pitta: -1, kapha: 1 },    // Sweet decreases V,P increases K
                amla: { vata: -1, pitta: 1, kapha: 1 },        // Sour decreases V, increases P,K
                lavana: { vata: -1, pitta: 1, kapha: 1 },      // Salty decreases V, increases P,K
                katu: { vata: 1, pitta: 1, kapha: -1 },        // Pungent increases V,P decreases K
                tikta: { vata: 1, pitta: -1, kapha: -1 },      // Bitter increases V, decreases P,K
                kashaya: { vata: 1, pitta: -1, kapha: -1 }     // Astringent increases V, decreases P,K
            },
            
            // Virya (Potency) - thermal effect
            virya: {
                ushna: { vata: -1, pitta: 1, kapha: -1 },      // Hot decreases V,K increases P
                sheeta: { vata: 1, pitta: -1, kapha: 1 },      // Cold increases V,K decreases P
                anushna: { vata: 0, pitta: 0, kapha: 0 }       // Neutral
            },
            
            // Vipaka (Post-digestive effect)
            vipaka: {
                madhura: { vata: -1, pitta: -1, kapha: 1 },    // Sweet post-digestion
                amla: { vata: -1, pitta: 1, kapha: 1 },        // Sour post-digestion
                katu: { vata: 1, pitta: 1, kapha: -1 }         // Pungent post-digestion
            }
        };
        
        // Enhanced feature weights based on traditional importance
        this.traditionalWeights = {
            bodyFrame: 1.5,      // Fundamental constitutional indicator
            digestion: 1.4,      // Agni (digestive fire) is crucial
            appetite: 1.3,       // Related to digestive capacity
            energy: 1.2,         // Ojas (vital energy)
            sleep: 1.2,          // Fundamental for balance
            stressResponse: 1.1, // Mental constitution
            skin: 1.0,           // Physical manifestation
            hair: 0.9,           // Secondary physical trait
            eyes: 0.8            // Tertiary indicator
        };
    }
    
    /**
     * Enhance existing features with Ayurvedic principles
     */
    enhanceFeatures(responses, existingFeatures) {
        const enhanced = { ...existingFeatures };
        
        // Add traditional Ayurvedic scoring
        enhanced.traditionalScore = this.calculateTraditionalScore(responses);
        
        // Add constitutional stability index
        enhanced.constitutionalStability = this.calculateStabilityIndex(responses);
        
        // Add seasonal adjustment factor
        enhanced.seasonalFactor = this.getSeasonalAdjustment();
        
        // Add digestive fire (Agni) assessment
        enhanced.agniScore = this.calculateAgniScore(responses);
        
        // Add mental constitution (Sattva, Rajas, Tamas) indicators
        enhanced.mentalConstitution = this.calculateMentalConstitution(responses);
        
        return enhanced;
    }
    
    /**
     * Calculate traditional Ayurvedic score based on classical principles
     */
    calculateTraditionalScore(responses) {
        let vataScore = 0, pittaScore = 0, kaphaScore = 0;
        
        responses.forEach((response, index) => {
            const weight = this.traditionalWeights[this.getFeatureName(index)] || 1.0;
            
            if (response === 0) vataScore += weight;
            else if (response === 1) pittaScore += weight;
            else if (response === 2) kaphaScore += weight;
        });
        
        const total = vataScore + pittaScore + kaphaScore;
        return {
            vata: vataScore / total,
            pitta: pittaScore / total,
            kapha: kaphaScore / total,
            dominance: Math.max(vataScore, pittaScore, kaphaScore) / total
        };
    }
    
    /**
     * Calculate constitutional stability based on response consistency
     */
    calculateStabilityIndex(responses) {
        const counts = [0, 0, 0]; // vata, pitta, kapha counts
        responses.forEach(r => counts[r]++);
        
        const total = responses.length;
        const variance = counts.reduce((sum, count) => {
            const proportion = count / total;
            return sum + Math.pow(proportion - 1/3, 2);
        }, 0);
        
        // Higher variance = less stable constitution
        return 1 - (variance * 1.5); // Normalize to 0-1 scale
    }
    
    /**
     * Get seasonal adjustment factor based on current season
     */
    getSeasonalAdjustment() {
        const month = new Date().getMonth();
        
        // Seasonal dosha influences
        if (month >= 2 && month <= 4) { // Spring (Kapha season)
            return { vata: 0.9, pitta: 1.0, kapha: 1.2 };
        } else if (month >= 5 && month <= 8) { // Summer (Pitta season)
            return { vata: 0.9, pitta: 1.3, kapha: 0.8 };
        } else if (month >= 9 && month <= 11) { // Autumn (Vata season)
            return { vata: 1.3, pitta: 0.9, kapha: 0.8 };
        } else { // Winter (Kapha season)
            return { vata: 1.1, pitta: 0.8, kapha: 1.1 };
        }
    }
    
    /**
     * Calculate Agni (digestive fire) score
     */
    calculateAgniScore(responses) {
        // Focus on digestion, appetite, and energy-related responses
        const digestiveIndices = [10, 11, 9]; // appetite, digestion, energy
        let agniScore = 0;
        
        digestiveIndices.forEach(index => {
            if (index < responses.length) {
                // Pitta responses (1) indicate strong Agni
                // Vata responses (0) indicate irregular Agni
                // Kapha responses (2) indicate slow Agni
                if (responses[index] === 1) agniScore += 2;
                else if (responses[index] === 0) agniScore += 1;
                else agniScore += 0.5;
            }
        });
        
        return agniScore / (digestiveIndices.length * 2); // Normalize to 0-1
    }
    
    /**
     * Calculate mental constitution indicators
     */
    calculateMentalConstitution(responses) {
        // Based on memory, decision making, stress response
        const mentalIndices = [5, 6, 7]; // memory, decisionMaking, stressResponse
        let sattvic = 0, rajasic = 0, tamasic = 0;
        
        mentalIndices.forEach(index => {
            if (index < responses.length) {
                const response = responses[index];
                if (response === 1) rajasic++; // Pitta - active, sharp
                else if (response === 0) rajasic++; // Vata - quick, changeable
                else sattvic++; // Kapha - stable, calm
            }
        });
        
        const total = mentalIndices.length;
        return {
            sattvic: sattvic / total,
            rajasic: rajasic / total,
            tamasic: tamasic / total
        };
    }
    
    /**
     * Get feature name by index
     */
    getFeatureName(index) {
        const featureNames = [
            'bodyFrame', 'bodyWeight', 'skin', 'hair', 'eyes',
            'memory', 'decisionMaking', 'stressResponse', 'sleep', 'energy',
            'appetite', 'digestion', 'activityLevel', 'weatherPreference', 'communication'
        ];
        return featureNames[index] || 'unknown';
    }
    
    /**
     * Apply Dr. Kulkarni's Decision Tree principles
     */
    applyDecisionTreePrinciples(features) {
        // Implement key decision rules from Dr. Kulkarni's research
        const rules = [];
        
        // Rule 1: Virya (thermal preference) as primary classifier
        if (features.weatherPreference !== undefined) {
            if (features.weatherPreference > 0.5) { // Prefers cold (Pitta indication)
                rules.push({ type: 'pitta', confidence: 0.7 });
            } else { // Prefers warmth (Vata/Kapha indication)
                rules.push({ type: 'vata_kapha', confidence: 0.6 });
            }
        }
        
        // Rule 2: Digestive capacity (Agni) classification
        if (features.agniScore > 0.7) {
            rules.push({ type: 'pitta', confidence: 0.8 });
        } else if (features.agniScore < 0.4) {
            rules.push({ type: 'kapha', confidence: 0.6 });
        }
        
        // Rule 3: Constitutional stability
        if (features.constitutionalStability < 0.5) {
            rules.push({ type: 'vata', confidence: 0.7 });
        }
        
        return rules;
    }
    
    /**
     * Generate enhanced prediction with traditional principles
     */
    generateEnhancedPrediction(responses, baseFeatures) {
        const enhancedFeatures = this.enhanceFeatures(responses, baseFeatures);
        const decisionRules = this.applyDecisionTreePrinciples(enhancedFeatures);
        
        return {
            enhancedFeatures,
            decisionRules,
            traditionalScore: enhancedFeatures.traditionalScore,
            recommendations: this.generateTraditionalRecommendations(enhancedFeatures)
        };
    }
    
    /**
     * Generate recommendations based on traditional Ayurvedic principles
     */
    generateTraditionalRecommendations(features) {
        const recommendations = [];
        
        // Agni-based recommendations
        if (features.agniScore < 0.4) {
            recommendations.push("Focus on improving digestive fire (Agni) with warm, cooked foods");
            recommendations.push("Avoid cold drinks and raw foods");
        } else if (features.agniScore > 0.8) {
            recommendations.push("Cool down excessive digestive fire with cooling foods");
            recommendations.push("Avoid spicy and heating foods");
        }
        
        // Seasonal recommendations
        const seasonal = features.seasonalFactor;
        const dominantSeason = Object.keys(seasonal).reduce((a, b) => 
            seasonal[a] > seasonal[b] ? a : b
        );
        
        recommendations.push(`Current season favors ${dominantSeason} - adjust lifestyle accordingly`);
        
        // Constitutional stability recommendations
        if (features.constitutionalStability < 0.5) {
            recommendations.push("Focus on establishing regular routines to improve constitutional stability");
        }
        
        return recommendations;
    }
}

// Export for use in Enhanced Dataset Model
if (typeof window !== 'undefined') {
    window.AyurvedicFeatureEnhancer = AyurvedicFeatureEnhancer;
}

console.log('🌿 Ayurvedic Feature Enhancer loaded - Traditional wisdom meets modern ML');
