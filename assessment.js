// Simple Assessment Script
console.log('Assessment script loading...');

// Assessment Questions Data
const assessmentQuestions = [
    {
        question: "Body Frame",
        options: ["Thin, light", "Medium build", "Large, heavy"]
    },
    {
        question: "Weight",
        options: ["Low, hard to gain", "Moderate", "Heavy, easy to gain"]
    },
    {
        question: "Skin",
        options: ["Dry, rough, cool", "Soft, oily, warm", "Thick, oily, cool"]
    },
    {
        question: "Hair",
        options: ["Dry, brittle, thin", "Fine, oily, early gray", "Thick, oily, wavy"]
    },
    {
        question: "Eyes",
        options: ["Small, dry, active", "Sharp, bright, medium", "Large, calm, attractive"]
    },
    {
        question: "Memory",
        options: ["Quick to learn, quick to forget", "Sharp, clear", "Slow to learn, good retention"]
    },
    {
        question: "Decision Making",
        options: ["Quick, changes mind often", "Sharp, decisive", "Slow, steady"]
    },
    {
        question: "Stress Response",
        options: ["Anxious, worried", "Irritable, angry", "Calm, withdrawn"]
    },
    {
        question: "Sleep",
        options: ["Light, interrupted", "Sound, moderate", "Deep, long"]
    },
    {
        question: "Energy",
        options: ["Comes in bursts", "Intense, focused", "Steady, enduring"]
    },
    {
        question: "Appetite",
        options: ["Variable, skips meals", "Strong, regular", "Steady, can skip meals"]
    },
    {
        question: "Digestion",
        options: ["Irregular, gas", "Quick, heartburn", "Slow, heavy feeling"]
    },
    {
        question: "Activity Level",
        options: ["Very active, restless", "Moderate, purposeful", "Slow, steady"]
    },
    {
        question: "Weather Preference",
        options: ["Warm, humid", "Cool, well-ventilated", "Warm, dry"]
    },
    {
        question: "Communication",
        options: ["Talks fast, a lot", "Sharp, precise", "Slow, thoughtful"]
    }
];

function generateAssessmentQuestions() {
    console.log('Generating assessment questions...');
    const container = document.getElementById('questions-container');
    
    if (!container) {
        console.error('Questions container not found!');
        return;
    }
    
    container.innerHTML = '';

    assessmentQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-group';

        questionDiv.innerHTML = `
            <h3 class="question-title">${q.question}</h3>
            <div class="question-options">
                ${q.options.map((option, optionIndex) => `
                    <label class="option-label">
                        <input type="radio" name="question_${index}" value="${optionIndex}" required>
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;

        container.appendChild(questionDiv);
    });
    
    console.log('Assessment questions generated successfully');
}

// Optimized progress tracking with cached elements and efficient counting
let progressElements = null;
let totalQuestions = 0;

function initializeProgressTracking() {
    progressElements = {
        text: document.getElementById('progress-text'),
        fill: document.getElementById('progress-fill')
    };
    totalQuestions = assessmentQuestions.length;
}

function updateProgress() {
    if (!progressElements) initializeProgressTracking();
    
    // More efficient: count checked radios within the form only
    const form = document.getElementById('assessment-form');
    if (!form) return;
    
    const answeredQuestions = form.querySelectorAll('input[type="radio"]:checked').length;
    const percentage = (answeredQuestions / totalQuestions) * 100;

    if (progressElements.text) progressElements.text.textContent = `${answeredQuestions}/${totalQuestions}`;
    if (progressElements.fill) progressElements.fill.style.width = `${percentage}%`;
    
    // Trigger modern interactions if available, but throttled
    if (typeof modernInteractions !== 'undefined' && modernInteractions.animateProgressBar) {
        clearTimeout(updateProgress.throttleTimer);
        updateProgress.throttleTimer = setTimeout(() => {
            modernInteractions.animateProgressBar();
        }, 100);
    }
}

async function processAssessment() {
    console.log('Processing assessment...');
    
    // Wait a moment for models to fully initialize if needed
    if (!window.enhancedDatasetPrakritiModel && !window.advancedPrakritiModel) {
        console.log('Waiting for models to initialize...');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const formData = new FormData(document.getElementById('assessment-form'));
    const responses = [];

    // Collect responses
    for (let i = 0; i < assessmentQuestions.length; i++) {
        const response = formData.get(`question_${i}`);
        if (response !== null) {
            responses.push(parseInt(response));
        }
    }

    console.log('Responses collected:', responses);

    if (responses.length !== assessmentQuestions.length) {
        alert('Please answer all questions before submitting.');
        return;
    }

    // Use Python ML model or fallback
    let results;
    
    try {
        let mlResults;
        let modelUsed = 'fallback';
        
        // Prefer the real CSV-trained classifier if it loaded; fall back to legacy rule-based scorers.
        const model =
            window.realPrakritiModel ||
            window.enhancedDatasetPrakritiModel ||
            window.advancedPrakritiModel ||
            window.prakritiModel;
        
        if (model && typeof model.predictDosha === 'function') {
            console.log('🚀 Using Enhanced Dataset ML Model v3.0.0 for prediction...');
            mlResults = await model.predictDosha(responses);
            modelUsed = 'enhancedDatasetModel';
        }
        // No ML model available
        else {
            console.warn('Enhanced Dataset Model not found, available models:', {
                enhancedDatasetPrakritiModel: typeof window.enhancedDatasetPrakritiModel,
                advancedPrakritiModel: typeof window.advancedPrakritiModel,
                prakritiModel: typeof window.prakritiModel
            });
            throw new Error('No ML model available');
        }
        
        console.log('ML Model results:', mlResults);
        
        results = {
            primary_dosha: mlResults.constitution.includes('+') ? mlResults.constitution.split('+')[0] : mlResults.constitution,
            dosha_percentages: mlResults.percentages,
            confidence: mlResults.confidence === 'high' ? 0.9 : mlResults.confidence === 'medium' ? 0.7 : 0.5,
            constitution: mlResults.constitution,
            analysis: mlResults.analysis,
            timestamp: new Date().toISOString(),
            datasetBased: mlResults.datasetBased || true,
            trainingSamples: mlResults.trainingSamples || mlResults.csvSamples || 'Unknown',
            modelUsed: modelUsed,
            modelVersion: mlResults.modelVersion || (modelUsed === 'enhancedDatasetModel' ? '3.0.0' : '2.0.0'),
            csvSamples: mlResults.csvSamples,
            syntheticSamples: mlResults.syntheticSamples
        };
    } catch (error) {
        console.error('ML Model error, falling back to simple calculation:', error);
        
        // Fallback to simple calculation if ML model fails
        let vataScore = 0;
        let pittaScore = 0;
        let kaphaScore = 0;

        responses.forEach(response => {
            if (response === 0) vataScore++;
            else if (response === 1) pittaScore++;
            else if (response === 2) kaphaScore++;
        });

        const total = vataScore + pittaScore + kaphaScore;
        results = {
            primary_dosha: vataScore > pittaScore && vataScore > kaphaScore ? 'vata' : 
                          pittaScore > kaphaScore ? 'pitta' : 'kapha',
            dosha_percentages: {
                vata: Math.round((vataScore / total) * 100),
                pitta: Math.round((pittaScore / total) * 100),
                kapha: Math.round((kaphaScore / total) * 100)
            },
            confidence: 0.6,
            timestamp: new Date().toISOString(),
            datasetBased: false,
            trainingSamples: 0
        };
    }

    console.log('Assessment results:', results);
    displayResults(results);

    // Update personalized insights after assessment completion
    setTimeout(() => {
        if (typeof generateInsights === 'function') {
            console.log('Updating personalized insights after assessment...');
            generateInsights();
            
            // Add visual indicator to insights tab
            const insightsTab = document.getElementById('insights-tab');
            if (insightsTab) {
                insightsTab.innerHTML = `
                    🎯 Personalized Insights 
                    <span class="badge bg-success ms-1">New!</span>
                `;
                
                // Remove the badge after 10 seconds
                setTimeout(() => {
                    insightsTab.innerHTML = '🎯 Personalized Insights';
                }, 10000);
            }
        }
    }, 1000);

    // Persist results so other pages (Diet/Lifestyle/Progress) can use them
    try {
        // Build a compatible object with script.js schema
        const savedObj = {
            primary_dosha: results.primary_dosha,
            dosha_percentages: results.dosha_percentages,
            confidence: typeof results.confidence === 'number' ? results.confidence : 0.7,
            constitution: results.primary_dosha,
            analysis: { confidence_explanation: '', dominantTraits: [] },
            timestamp: new Date().toISOString(),
            responses: [],
            datasetBased: false,
            trainingSamples: 0
        };

        // Expose globally if available
        try { window.currentUser = savedObj; } catch (e) { /* ignore */ }

        const existing = localStorage.getItem('ayurvedic_prakriti_data');
        let payload = { currentUser: savedObj, assessmentHistory: [savedObj], lastUpdated: new Date().toISOString() };
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                const history = Array.isArray(parsed.assessmentHistory) ? parsed.assessmentHistory : [];
                history.push(savedObj);
                payload = { currentUser: savedObj, assessmentHistory: history, lastUpdated: new Date().toISOString() };
            } catch (e) {
                // fallback uses default payload
            }
        }
        localStorage.setItem('ayurvedic_prakriti_data', JSON.stringify(payload));

        // If script.js helpers exist, update UI and pre-populate
        if (typeof updateDataStatus === 'function') {
            try { updateDataStatus(); } catch (e) { /* ignore */ }
        }
        if (typeof loadDietPlan === 'function') {
            try { loadDietPlan(); } catch (e) { /* ignore */ }
        }
        if (typeof loadLifestyleRecommendations === 'function') {
            try { loadLifestyleRecommendations(); } catch (e) { /* ignore */ }
        }
    } catch (persistErr) {
        console.error('Failed to persist assessment results:', persistErr);
    }
}

function displayResults(results) {
    console.log('Displaying results...');
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');

    if (!resultsSection || !resultsContent) {
        console.error('Results elements not found');
        return;
    }

    const doshaColors = {
        vata: '#2E8B57',
        pitta: '#DAA520',
        kapha: '#8B4513'
    };

    const doshaDescriptions = {
        vata: 'Air and space elements. Governs movement, breathing, and nervous system.',
        pitta: 'Fire and water elements. Governs digestion, metabolism, and transformation.',
        kapha: 'Earth and water elements. Governs structure, immunity, and stability.'
    };

    resultsContent.innerHTML = `
        <div class="results-container">
            <div class="results-header">
                <h2>🎯 Your Prakriti Results</h2>
                <p class="results-subtitle">Based on your responses, here is your Ayurvedic constitution analysis:</p>
                ${results.datasetBased ? 
                    (results.modelUsed === 'enhancedDatasetModel' ? 
                        `<p class="ml-info">🚀 Enhanced Dataset Model v${results.modelVersion} (${results.trainingSamples} total samples: ${results.csvSamples || '5,001'} real + ${results.syntheticSamples || '250'} synthetic)</p>` :
                        `<p class="ml-info">✨ Results from trained ML model (${results.trainingSamples} training samples)</p>`
                    ) : 
                    '<p class="fallback-info">⚠️ Using fallback calculation method</p>'
                }
            </div>
            <div class="primary-dosha-card">
                <h3>Your Primary Dosha: <span style="color: ${doshaColors[results.primary_dosha]}">${results.primary_dosha.charAt(0).toUpperCase() + results.primary_dosha.slice(1)}</span></h3>
                <p>${doshaDescriptions[results.primary_dosha]}</p>
            </div>
            
            <div class="dosha-breakdown">
                <h4>Dosha Breakdown:</h4>
                <div class="dosha-bars">
                    <div class="dosha-bar">
                        <span>Vata: ${results.dosha_percentages.vata}%</span>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${results.dosha_percentages.vata}%; background-color: ${doshaColors.vata}"></div>
                        </div>
                    </div>
                    <div class="dosha-bar">
                        <span>Pitta: ${results.dosha_percentages.pitta}%</span>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${results.dosha_percentages.pitta}%; background-color: ${doshaColors.pitta}"></div>
                        </div>
                    </div>
                    <div class="dosha-bar">
                        <span>Kapha: ${results.dosha_percentages.kapha}%</span>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${results.dosha_percentages.kapha}%; background-color: ${doshaColors.kapha}"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <div class="alert alert-info border-0 shadow-sm">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-lightbulb-fill text-warning" style="font-size: 1.5rem;"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="alert-heading mb-1">🎯 Your Personalized Insights Are Ready!</h6>
                            <p class="mb-2">Navigate to the <strong>AI Assistant</strong> page and click on the <strong>Personalized Insights</strong> tab to discover detailed recommendations tailored to your ${results.primary_dosha.charAt(0).toUpperCase() + results.primary_dosha.slice(1)} constitution.</p>
                            <button onclick="navigateToInsights()" class="btn btn-warning btn-sm">
                                <i class="bi bi-arrow-right me-1"></i>View My Insights
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Show feedback UI after a short delay
    setTimeout(() => {
        if (typeof userFeedbackSystem !== 'undefined') {
            userFeedbackSystem.showFeedbackUI({
                id: Date.now(),
                ...results
            });
        }
    }, 2000);
    
    console.log('Results displayed successfully');
}

// Function to navigate directly to insights tab
function navigateToInsights() {
    // Navigate to AI Assistant page
    if (typeof navigateToPage === 'function') {
        navigateToPage('ai-assistant');
        
        // Wait a moment for page to load, then switch to insights tab
        setTimeout(() => {
            const insightsTab = document.getElementById('insights-tab');
            const insightsContent = document.getElementById('insights-content');
            
            if (insightsTab && insightsContent) {
                // Deactivate all tabs
                document.querySelectorAll('#ai-tabs .nav-link').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // Activate insights tab
                insightsTab.classList.add('active');
                insightsContent.classList.add('show', 'active');
                
                // Generate insights
                if (typeof generateInsights === 'function') {
                    generateInsights();
                }
                
                // Scroll to insights section
                insightsContent.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }
}

// Initialize assessment when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Assessment DOM loaded');
    
    setTimeout(function() {
        generateAssessmentQuestions();
        
        // Add form submit handler and optimized progress tracking
        const form = document.getElementById('assessment-form');
        if (form) {
            // Submit handler
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                processAssessment();
            });
            
            // Optimized progress tracking with event delegation
            form.addEventListener('change', function(e) {
                if (e.target.type === 'radio') {
                    updateProgress();
                    
                    // Add selection feedback if modern interactions are available
                    if (typeof modernInteractions !== 'undefined' && modernInteractions.addSelectionFeedback) {
                        modernInteractions.addSelectionFeedback(e.target);
                    }
                }
            });
            
            console.log('Assessment form handlers added');
        }
        
        console.log('Assessment initialized successfully');
    }, 500);
});

console.log('Assessment script loaded');