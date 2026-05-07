/**
 * User Feedback Collection and A/B Testing System
 * Priority 2 Implementation: User feedback collection and A/B testing framework
 */

class UserFeedbackSystem {
    constructor() {
        this.feedbackStorage = 'prakriti_feedback_data';
        this.abTestStorage = 'prakriti_ab_test_data';
        this.feedbackQueue = [];
        this.abTestConfig = {
            enabled: true,
            trafficSplit: 0.8, // 80% original model, 20% advanced model
            testName: 'advanced_model_test',
            startDate: new Date(),
            minSamples: 50
        };
        
        this.loadStoredData();
        this.initializeFeedbackUI();
    }

    loadStoredData() {
        try {
            const feedbackData = localStorage.getItem(this.feedbackStorage);
            if (feedbackData) {
                this.feedbackQueue = JSON.parse(feedbackData);
            }

            const abTestData = localStorage.getItem(this.abTestStorage);
            if (abTestData) {
                this.abTestResults = JSON.parse(abTestData);
            } else {
                this.abTestResults = {
                    originalModel: { predictions: [], feedback: [] },
                    advancedModel: { predictions: [], feedback: [] }
                };
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.feedbackQueue = [];
            this.abTestResults = {
                originalModel: { predictions: [], feedback: [] },
                advancedModel: { predictions: [], feedback: [] }
            };
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.feedbackStorage, JSON.stringify(this.feedbackQueue));
            localStorage.setItem(this.abTestStorage, JSON.stringify(this.abTestResults));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    initializeFeedbackUI() {
        // Add feedback UI to results section
        document.addEventListener('DOMContentLoaded', () => {
            this.injectFeedbackUI();
        });
    }

    injectFeedbackUI() {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        // Create feedback container
        const feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'feedback-container';
        feedbackContainer.className = 'feedback-container';
        feedbackContainer.style.display = 'none';
        
        feedbackContainer.innerHTML = `
            <div class="feedback-card">
                <div class="card-header">
                    <span class="card-icon">💬</span>
                    <h4 class="card-title">How accurate was your result?</h4>
                </div>
                <div class="card-content">
                    <p>Your feedback helps us improve our predictions for everyone!</p>
                    
                    <div class="feedback-rating">
                        <label>Accuracy Rating:</label>
                        <div class="rating-buttons">
                            <button class="rating-btn" data-rating="1">😞 Poor</button>
                            <button class="rating-btn" data-rating="2">😐 Fair</button>
                            <button class="rating-btn" data-rating="3">🙂 Good</button>
                            <button class="rating-btn" data-rating="4">😊 Very Good</button>
                            <button class="rating-btn" data-rating="5">🤩 Excellent</button>
                        </div>
                    </div>

                    <div class="feedback-corrections">
                        <label>What would you change? (Optional)</label>
                        <div class="correction-options">
                            <label><input type="checkbox" name="correction" value="primary_dosha"> Primary dosha seems wrong</label>
                            <label><input type="checkbox" name="correction" value="percentages"> Percentages don't feel right</label>
                            <label><input type="checkbox" name="correction" value="recommendations"> Recommendations don't fit me</label>
                            <label><input type="checkbox" name="correction" value="confidence"> Confidence level is off</label>
                        </div>
                    </div>

                    <div class="feedback-comments">
                        <label>Additional Comments (Optional):</label>
                        <textarea id="feedback-comments" placeholder="Tell us more about your experience..."></textarea>
                    </div>

                    <div class="feedback-actions">
                        <button id="submit-feedback" class="btn-primary">Submit Feedback</button>
                        <button id="skip-feedback" class="btn-secondary">Skip</button>
                    </div>
                </div>
            </div>
        `;

        resultsSection.appendChild(feedbackContainer);
        this.setupFeedbackEventListeners();
    }

    setupFeedbackEventListeners() {
        // Rating buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-btn')) {
                // Remove active class from all rating buttons
                document.querySelectorAll('.rating-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Store selected rating
                this.selectedRating = parseInt(e.target.dataset.rating);
            }
        });

        // Submit feedback
        document.addEventListener('click', (e) => {
            if (e.target.id === 'submit-feedback') {
                this.submitFeedback();
            } else if (e.target.id === 'skip-feedback') {
                this.hideFeedbackUI();
            }
        });
    }

    showFeedbackUI(predictionData) {
        this.currentPrediction = predictionData;
        const feedbackContainer = document.getElementById('feedback-container');
        if (feedbackContainer) {
            feedbackContainer.style.display = 'block';
            feedbackContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    hideFeedbackUI() {
        const feedbackContainer = document.getElementById('feedback-container');
        if (feedbackContainer) {
            feedbackContainer.style.display = 'none';
        }
        this.resetFeedbackForm();
    }

    resetFeedbackForm() {
        // Reset rating selection
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset checkboxes
        document.querySelectorAll('input[name="correction"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Reset comments
        const commentsTextarea = document.getElementById('feedback-comments');
        if (commentsTextarea) {
            commentsTextarea.value = '';
        }
        
        this.selectedRating = null;
    }

    submitFeedback() {
        if (!this.selectedRating) {
            alert('Please select an accuracy rating before submitting.');
            return;
        }

        // Collect feedback data
        const corrections = Array.from(document.querySelectorAll('input[name="correction"]:checked'))
            .map(cb => cb.value);
        
        const comments = document.getElementById('feedback-comments')?.value || '';

        const feedbackData = {
            id: this.generateFeedbackId(),
            predictionId: this.currentPrediction?.id || Date.now(),
            timestamp: new Date(),
            rating: this.selectedRating,
            corrections,
            comments,
            prediction: this.currentPrediction,
            modelVersion: this.currentPrediction?.modelVersion || 'unknown',
            userAgent: navigator.userAgent,
            processed: false
        };

        // Store feedback
        this.feedbackQueue.push(feedbackData);
        
        // Record for A/B test if applicable
        this.recordABTestFeedback(feedbackData);
        
        // Save to localStorage
        this.saveData();

        // Show thank you message
        this.showThankYouMessage();
        
        // Hide feedback UI
        setTimeout(() => {
            this.hideFeedbackUI();
        }, 2000);

        console.log('✅ Feedback submitted:', feedbackData.id);
    }

    showThankYouMessage() {
        const feedbackContainer = document.getElementById('feedback-container');
        if (feedbackContainer) {
            const originalContent = feedbackContainer.innerHTML;
            
            feedbackContainer.innerHTML = `
                <div class="feedback-card">
                    <div class="card-header">
                        <span class="card-icon">🙏</span>
                        <h4 class="card-title">Thank You!</h4>
                    </div>
                    <div class="card-content">
                        <p>Your feedback has been recorded and will help us improve our predictions.</p>
                        <div class="feedback-stats">
                            <small>Total feedback collected: ${this.feedbackQueue.length}</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    generateFeedbackId() {
        return 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Programmatic feedback collection for testing
    collectFeedback(predictionId, feedbackData) {
        const feedback = {
            id: this.generateFeedbackId(),
            predictionId: predictionId,
            timestamp: new Date(),
            rating: feedbackData.rating || 5,
            corrections: feedbackData.corrections || [],
            comments: feedbackData.comments || '',
            prediction: feedbackData.prediction || null,
            modelVersion: feedbackData.modelVersion || 'test',
            userAgent: navigator.userAgent,
            processed: false
        };

        // Store feedback
        this.feedbackQueue.push(feedback);
        
        // Record for A/B test if applicable
        this.recordABTestFeedback(feedback);
        
        // Save to localStorage
        this.saveData();

        console.log('✅ Feedback collected programmatically:', feedback.id);
        return feedback.id;
    }

    // A/B Testing Methods
    shouldUseAdvancedModel(userId = null) {
        if (!this.abTestConfig.enabled) {
            return false;
        }

        // Use user ID for consistent assignment, or random for anonymous users
        const hash = userId ? this.hashString(userId) : Math.random();
        return hash > this.abTestConfig.trafficSplit;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) / 2147483647; // Normalize to 0-1
    }

    recordABTestPrediction(modelType, predictionData) {
        if (!this.abTestResults[modelType]) {
            this.abTestResults[modelType] = { predictions: [], feedback: [] };
        }

        this.abTestResults[modelType].predictions.push({
            id: predictionData.id || Date.now(),
            timestamp: new Date(),
            constitution: predictionData.constitution,
            confidence: predictionData.confidence,
            modelVersion: predictionData.modelVersion
        });

        this.saveData();
    }

    recordABTestFeedback(feedbackData) {
        // Determine model type based on version
        let modelType;
        if (feedbackData.modelVersion === '2.0.0' || feedbackData.modelVersion === 'advanced') {
            modelType = 'advancedModel';
        } else {
            modelType = 'originalModel';
        }
        
        if (!this.abTestResults[modelType]) {
            this.abTestResults[modelType] = { predictions: [], feedback: [] };
        }

        this.abTestResults[modelType].feedback.push({
            id: feedbackData.id,
            timestamp: feedbackData.timestamp,
            rating: feedbackData.rating,
            corrections: feedbackData.corrections || []
        });

        console.log(`📊 Recorded feedback for ${modelType}: rating ${feedbackData.rating}`);
        this.saveData();
    }

    getABTestResults() {
        const results = {
            testConfig: this.abTestConfig,
            originalModel: this.calculateModelStats('originalModel'),
            advancedModel: this.calculateModelStats('advancedModel'),
            comparison: this.compareModels()
        };

        return results;
    }

    calculateModelStats(modelType) {
        const data = this.abTestResults[modelType];
        if (!data || data.feedback.length === 0) {
            return {
                predictions: data?.predictions.length || 0,
                feedbackCount: 0,
                averageRating: 0,
                satisfactionRate: 0
            };
        }

        const ratings = data.feedback.map(f => f.rating);
        const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const satisfactionRate = ratings.filter(r => r >= 4).length / ratings.length;

        return {
            predictions: data.predictions.length,
            feedbackCount: data.feedback.length,
            averageRating: averageRating.toFixed(2),
            satisfactionRate: (satisfactionRate * 100).toFixed(1) + '%',
            ratingDistribution: this.getRatingDistribution(ratings)
        };
    }

    getRatingDistribution(ratings) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(rating => {
            distribution[rating]++;
        });
        return distribution;
    }

    compareModels() {
        const original = this.calculateModelStats('originalModel');
        const advanced = this.calculateModelStats('advancedModel');

        if (original.feedbackCount === 0 || advanced.feedbackCount === 0) {
            return { status: 'insufficient_data', message: 'Not enough feedback for comparison' };
        }

        const ratingDiff = parseFloat(advanced.averageRating) - parseFloat(original.averageRating);
        const satisfactionDiff = parseFloat(advanced.satisfactionRate) - parseFloat(original.satisfactionRate);

        return {
            status: 'comparison_available',
            ratingImprovement: ratingDiff.toFixed(2),
            satisfactionImprovement: satisfactionDiff.toFixed(1) + '%',
            recommendation: this.getRecommendation(ratingDiff, satisfactionDiff),
            significance: this.calculateSignificance(original, advanced)
        };
    }

    getRecommendation(ratingDiff, satisfactionDiff) {
        if (ratingDiff > 0.3 && satisfactionDiff > 10) {
            return 'Strong evidence for advanced model - recommend full rollout';
        } else if (ratingDiff > 0.1 && satisfactionDiff > 5) {
            return 'Moderate improvement - consider gradual rollout';
        } else if (ratingDiff < -0.1 || satisfactionDiff < -5) {
            return 'Advanced model performing worse - recommend rollback';
        } else {
            return 'No significant difference - continue testing';
        }
    }

    calculateSignificance(original, advanced) {
        // Simple significance test (would use proper statistical tests in production)
        const minSamples = 30;
        if (original.feedbackCount < minSamples || advanced.feedbackCount < minSamples) {
            return 'insufficient_samples';
        }
        
        const ratingDiff = Math.abs(parseFloat(advanced.averageRating) - parseFloat(original.averageRating));
        return ratingDiff > 0.5 ? 'significant' : 'not_significant';
    }

    // Analytics and Reporting
    getFeedbackAnalytics() {
        const analytics = {
            totalFeedback: this.feedbackQueue.length,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            commonCorrections: {},
            recentFeedback: [],
            trends: this.calculateTrends()
        };

        if (this.feedbackQueue.length > 0) {
            const ratings = this.feedbackQueue.map(f => f.rating);
            analytics.averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
            
            // Rating distribution
            ratings.forEach(rating => {
                analytics.ratingDistribution[rating]++;
            });

            // Common corrections
            this.feedbackQueue.forEach(feedback => {
                feedback.corrections.forEach(correction => {
                    analytics.commonCorrections[correction] = (analytics.commonCorrections[correction] || 0) + 1;
                });
            });

            // Recent feedback (last 10)
            analytics.recentFeedback = this.feedbackQueue
                .slice(-10)
                .map(f => ({
                    id: f.id,
                    rating: f.rating,
                    timestamp: f.timestamp,
                    modelVersion: f.modelVersion
                }));
        }

        return analytics;
    }

    calculateTrends() {
        if (this.feedbackQueue.length < 10) {
            return { status: 'insufficient_data' };
        }

        const recent = this.feedbackQueue.slice(-10);
        const older = this.feedbackQueue.slice(-20, -10);

        if (older.length === 0) {
            return { status: 'insufficient_historical_data' };
        }

        const recentAvg = recent.reduce((sum, f) => sum + f.rating, 0) / recent.length;
        const olderAvg = older.reduce((sum, f) => sum + f.rating, 0) / older.length;

        const trend = recentAvg - olderAvg;

        return {
            status: 'trend_available',
            direction: trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable',
            magnitude: Math.abs(trend).toFixed(2),
            recentAverage: recentAvg.toFixed(2),
            historicalAverage: olderAvg.toFixed(2)
        };
    }

    // Export feedback data
    exportFeedbackData() {
        const exportData = {
            feedback: this.feedbackQueue,
            abTestResults: this.abTestResults,
            analytics: this.getFeedbackAnalytics(),
            exportDate: new Date(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `prakriti_feedback_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        console.log('📊 Feedback data exported');
    }

    // Clear all feedback data
    clearFeedbackData() {
        if (confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
            this.feedbackQueue = [];
            this.abTestResults = {
                originalModel: { predictions: [], feedback: [] },
                advancedModel: { predictions: [], feedback: [] }
            };
            
            localStorage.removeItem(this.feedbackStorage);
            localStorage.removeItem(this.abTestStorage);
            
            console.log('🗑️ All feedback data cleared');
        }
    }
}

// Initialize feedback system
const userFeedbackSystem = new UserFeedbackSystem();

// Export for global access
if (typeof window !== 'undefined') {
    window.userFeedbackSystem = userFeedbackSystem;
}

// CSS for feedback UI (inject into page)
const feedbackCSS = `
<style>
.feedback-container {
    margin-top: 20px;
    animation: slideIn 0.3s ease-out;
}

.feedback-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid #dee2e6;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feedback-rating {
    margin: 15px 0;
}

.rating-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
}

.rating-btn {
    padding: 8px 12px;
    border: 2px solid #dee2e6;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.rating-btn:hover {
    border-color: #007bff;
    background: #f8f9ff;
}

.rating-btn.active {
    border-color: #007bff;
    background: #007bff;
    color: white;
}

.feedback-corrections {
    margin: 15px 0;
}

.correction-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
}

.correction-options label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
}

.feedback-comments {
    margin: 15px 0;
}

.feedback-comments textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    resize: vertical;
    font-family: inherit;
}

.feedback-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.feedback-stats {
    margin-top: 10px;
    padding: 10px;
    background: rgba(0, 123, 255, 0.1);
    border-radius: 6px;
    text-align: center;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .rating-buttons {
        flex-direction: column;
    }
    
    .feedback-actions {
        flex-direction: column;
    }
}
</style>
`;

// Inject CSS
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', feedbackCSS);
});
