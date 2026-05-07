// Assessment Questions Data is defined in assessment.js to avoid duplicate declaration

// Dietary Recommendations Data
const dietaryRecommendations = {
    'vata': {
        description: 'Vata constitution tends to be cold, dry, and light. You need warm, moist, and grounding foods.',
        foods_to_eat: [
            'Warm, cooked foods',
            'Sweet, sour, and salty tastes',
            'Ghee, oils, and healthy fats',
            'Warm milk and herbal teas',
            'Cooked grains: rice, oats, quinoa',
            'Sweet fruits: bananas, dates, figs',
            'Cooked vegetables: sweet potatoes, carrots, beets',
            'Nuts and seeds (soaked)',
            'Warm spices: ginger, cinnamon, cardamom'
        ],
        foods_to_avoid: [
            'Cold, frozen, or raw foods',
            'Bitter, pungent, and astringent tastes',
            'Dry, light foods',
            'Caffeine and stimulants',
            'Beans and legumes (except mung)',
            'Cruciferous vegetables',
            'Dried fruits',
            'Carbonated drinks'
        ]
    },
    'pitta': {
        description: 'Pitta constitution tends to be hot and intense. You need cool, sweet, and calming foods.',
        foods_to_eat: [
            'Cool, fresh foods',
            'Sweet, bitter, and astringent tastes',
            'Fresh fruits: melons, grapes, pears',
            'Leafy greens and cooling vegetables',
            'Coconut water and herbal teas',
            'Basmati rice and barley',
            'Dairy products (if tolerated)',
            'Cooling spices: coriander, fennel, mint',
            'Ghee and coconut oil'
        ],
        foods_to_avoid: [
            'Spicy, hot, and pungent foods',
            'Sour and salty tastes',
            'Red meat and processed foods',
            'Alcohol and caffeine',
            'Tomatoes and citrus fruits',
            'Nuts (except coconut)',
            'Fermented foods',
            'Fried and oily foods'
        ]
    },
    'kapha': {
        description: 'Kapha constitution tends to be heavy and slow. You need light, warm, and stimulating foods.',
        foods_to_eat: [
            'Light, warm, and dry foods',
            'Pungent, bitter, and astringent tastes',
            'Spicy foods and warming spices',
            'Light fruits: apples, pears, berries',
            'Leafy greens and cruciferous vegetables',
            'Legumes and beans',
            'Herbal teas and warm water',
            'Honey (in moderation)',
            'Lean proteins'
        ],
        foods_to_avoid: [
            'Heavy, oily, and cold foods',
            'Sweet, sour, and salty tastes',
            'Dairy products',
            'Wheat and heavy grains',
            'Sweet fruits: bananas, dates',
            'Nuts and seeds',
            'Fried and processed foods',
            'Excessive water intake'
        ]
    }
};

// Lifestyle Recommendations Data is defined in lifestyle.js to avoid duplicate declaration

// Global Variables
let currentUser = null;
let assessmentHistory = [];
// geminiApiKey and chatHistory are declared in ai-assistant.js to avoid duplicate declaration

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Load any previously saved data first so initialization reflects it
    loadUserData();
    initializeApp();
    
    // Initialize sidebar collapse state
    initializeSidebarState();
    setupEventListeners();
    // Ensure data status reflects loaded data on first paint
    updateDataStatus();
});

function initializeApp() {
    // Show home page by default
    showPage('home');

    // Generate assessment questions
    generateAssessmentQuestions();

    // Update data status
    updateDataStatus();

    // Auto-enable AI features with permanent API key
    autoEnableAI();
}

function setupEventListeners() {
    // Navigation links - Simple direct approach
    setTimeout(() => {
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('Setting up navigation, found links:', navLinks.length);

        navLinks.forEach((link, index) => {
            console.log(`Setting up link ${index}:`, link.getAttribute('data-page'));
            link.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                const page = this.getAttribute('data-page');
                console.log('Direct click handler - navigating to:', page);

                // Direct navigation without separate function
                // Hide all pages
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                // Show target page
                const targetPage = document.getElementById(page + '-page');
                if (targetPage) {
                    targetPage.classList.add('active');
                    console.log('Successfully showed page:', page);
                } else {
                    console.error('Page not found:', page + '-page');
                }

                // Update nav active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                return false;
            };
        });
    }, 100);

    // Assessment form
    document.getElementById('assessment-form').addEventListener('submit', function (e) {
        e.preventDefault();
        processAssessment();
    });

    // Progress tracking is handled by assessment.js to avoid duplicate handlers

    // Chat input enter key
    document.addEventListener('keypress', function (e) {
        if (e.target.id === 'chat-input' && e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function navigateToPage(page) {
    console.log('Navigating to page:', page);

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else {
        console.error('Could not find nav link for page:', page);
    }

    // Show page
    showPage(page);
}

// Sidebar collapse functionality - Ultimate fix
function toggleSidebarCollapse() {
    console.log('🔥 TOGGLE SIDEBAR CALLED 🔥');
    
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    const floatingToggle = document.getElementById('floating-toggle');
    
    if (!sidebar) {
        console.error('❌ Sidebar element not found!');
        return;
    }
    
    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    console.log('Current collapsed state:', isCurrentlyCollapsed);
    
    if (isCurrentlyCollapsed) {
        // EXPAND - Show sidebar
        console.log('🟢 EXPANDING SIDEBAR');
        sidebar.classList.remove('collapsed');
        
        // Nuclear option - remove all classes and force styles
        sidebar.className = ''; // Remove ALL classes
        sidebar.setAttribute('style', `
            transform: translateX(0px) !important;
            width: 280px !important;
            pointer-events: auto !important;
            position: fixed !important;
            left: 0px !important;
            top: 0px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: none !important;
            background: linear-gradient(180deg, #f8f9fa, #e9ecef) !important;
            padding: 2rem 1rem !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
            overflow-y: auto !important;
        `);
        
        // Force immediate position without transition
        setTimeout(() => {
            sidebar.style.transition = 'transform 0.3s ease !important';
        }, 50);
        
        if (main) {
            main.style.marginLeft = '320px';
        }
        
        // Hide floating toggle when sidebar is visible
        if (floatingToggle) {
            floatingToggle.style.display = 'none';
        }
        
        console.log('✅ Sidebar should now be VISIBLE');
    } else {
        // COLLAPSE - Hide sidebar
        console.log('🔴 COLLAPSING SIDEBAR');
        sidebar.classList.add('collapsed');
        
        // Nuclear option - remove all classes and force styles
        sidebar.className = 'collapsed'; // Only keep collapsed class
        sidebar.setAttribute('style', `
            transform: translateX(-280px) !important;
            width: 280px !important;
            pointer-events: none !important;
            position: fixed !important;
            left: 0px !important;
            top: 0px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: none !important;
            background: linear-gradient(180deg, #f8f9fa, #e9ecef) !important;
            padding: 2rem 1rem !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
            overflow-y: auto !important;
        `);
        
        // Force immediate position without transition
        setTimeout(() => {
            sidebar.style.transition = 'transform 0.3s ease !important';
        }, 50);
        
        if (main) {
            main.style.marginLeft = '0px';
        }
        
        // Show floating toggle when sidebar is hidden
        if (floatingToggle) {
            floatingToggle.style.display = 'block';
        }
        
        console.log('✅ Sidebar should now be HIDDEN');
    }
    
    // Save state
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    
    // Debug verification
    setTimeout(() => {
        const computedTransform = window.getComputedStyle(sidebar).transform;
        console.log('🔍 Final transform:', computedTransform);
        console.log('🔍 Final width:', window.getComputedStyle(sidebar).width);
    }, 100);
}

// Initialize sidebar collapse state on page load
function initializeSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    const floatingToggle = document.getElementById('floating-toggle');
    const savedState = localStorage.getItem('sidebarCollapsed');
    
    if (!sidebar) return;
    
    if (savedState === 'true') {
        // Initialize as hidden
        sidebar.className = 'collapsed';
        sidebar.setAttribute('style', `
            transform: translateX(-280px) !important;
            width: 280px !important;
            pointer-events: none !important;
            position: fixed !important;
            left: 0px !important;
            top: 0px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: transform 0.3s ease !important;
            background: linear-gradient(180deg, #f8f9fa, #e9ecef) !important;
            padding: 2rem 1rem !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
            overflow-y: auto !important;
        `);
        if (main) {
            main.style.marginLeft = '0px';
        }
        // Show floating toggle when sidebar is hidden
        if (floatingToggle) {
            floatingToggle.style.display = 'block';
        }
    } else {
        // Initialize as visible
        sidebar.className = '';
        sidebar.setAttribute('style', `
            transform: translateX(0px) !important;
            width: 280px !important;
            pointer-events: auto !important;
            position: fixed !important;
            left: 0px !important;
            top: 0px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transition: transform 0.3s ease !important;
            background: linear-gradient(180deg, #f8f9fa, #e9ecef) !important;
            padding: 2rem 1rem !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
            overflow-y: auto !important;
        `);
        if (main) {
            main.style.marginLeft = '320px';
        }
        // Hide floating toggle when sidebar is visible
        if (floatingToggle) {
            floatingToggle.style.display = 'none';
        }
    }
}

// Debug function to check sidebar state
function debugSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    
    if (sidebar) {
        console.log('=== SIDEBAR DEBUG ===');
        console.log('Has collapsed class:', sidebar.classList.contains('collapsed'));
        console.log('Transform style:', sidebar.style.transform);
        console.log('Width style:', sidebar.style.width);
        console.log('Computed transform:', window.getComputedStyle(sidebar).transform);
        console.log('Computed width:', window.getComputedStyle(sidebar).width);
        if (main) {
            console.log('Main margin-left style:', main.style.marginLeft);
            console.log('Main computed margin-left:', window.getComputedStyle(main).marginLeft);
        }
        console.log('==================');
    }
}

function showPage(pageId) {
    console.log('Showing page:', pageId);

    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    console.log('Found pages:', allPages.length);
    allPages.forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Successfully showed page:', pageId);
    } else {
        console.error('Could not find page element:', `${pageId}-page`);
    }

    // Load page-specific content
    if (pageId === 'diet-plan') {
        loadDietPlan();
    } else if (pageId === 'lifestyle') {
        loadLifestyleRecommendations();
    } else if (pageId === 'progress') {
        loadProgressData();
    } else if (pageId === 'ai-assistant') {
        checkSavedAPIKey();
    }
}

function generateAssessmentQuestions() {
    const container = document.getElementById('questions-container');
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
}

// updateProgress function moved to assessment.js to avoid duplicates

function processAssessment() {
    const formData = new FormData(document.getElementById('assessment-form'));
    const responses = [];

    // Collect responses
    for (let i = 0; i < assessmentQuestions.length; i++) {
        const response = formData.get(`question_${i}`);
        if (response === null) {
            alert('Please answer all questions before submitting.');
            return;
        }
        responses.push(parseInt(response, 10));
    }

    // Use the trained ML model for prediction
    let mlResults;
    try {
        mlResults = prakritiModel.predictDosha(responses);
    } catch (error) {
        console.error('ML Model error:', error);
        // Fallback to basic calculation
        mlResults = calculateDoshaScores(responses);
    }

    // If ML output is invalid (e.g., NaN percentages), use fallback
    if (!isValidMlResults(mlResults)) {
        console.warn('Invalid ML results detected. Falling back to basic calculation.');
        mlResults = calculateDoshaScores(responses);
    }

    // Save results
    currentUser = {
        primary_dosha: mlResults.constitution.includes('+') ? mlResults.constitution.split('+')[0] : mlResults.constitution,
        dosha_percentages: mlResults.percentages,
        confidence: mlResults.confidence === 'high' ? 0.9 : mlResults.confidence === 'medium' ? 0.7 : 0.5,
        constitution: mlResults.constitution,
        analysis: mlResults.analysis,
        timestamp: new Date(),
        responses: responses,
        datasetBased: mlResults.datasetBased,
        trainingSamples: mlResults.trainingSamples
    };

    assessmentHistory.push(currentUser);
    saveUserData();

    // Display results
    displayResults(currentUser);

    // Pre-populate dependent sections so they are ready when user opens them
    try { loadDietPlan(); } catch (e) { console.warn('loadDietPlan() unavailable at this moment:', e); }
    try { loadLifestyleRecommendations(); } catch (e) { console.warn('loadLifestyleRecommendations() unavailable at this moment:', e); }

    // Update data status
    updateDataStatus();
}

// ML model prediction is now handled in processAssessment function

// Basic fallback calculation when ML model is unavailable or errors out
function calculateDoshaScores(responses) {
    // Map 0 -> vata, 1 -> pitta, 2 -> kapha
    let vata = 0, pitta = 0, kapha = 0;
    responses.forEach(r => {
        if (r === 0) vata++;
        else if (r === 1) pitta++;
        else if (r === 2) kapha++;
    });

    const total = vata + pitta + kapha || 1;
    const percentages = {
        vata: Math.round((vata / total) * 100),
        pitta: Math.round((pitta / total) * 100),
        kapha: Math.round((kapha / total) * 100)
    };

    // Determine constitution (dual if close)
    const entries = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
    const [top, second] = entries;
    const constitution = (top[1] - second[1] < 25) ? `${top[0]}+${second[0]}` : top[0];

    // Confidence buckets
    const dominance = top[1] - second[1];
    const confidence = dominance > 30 ? 'high' : dominance > 15 ? 'medium' : 'low';

    // Minimal analysis object
    const analysis = {
        constitution,
        dominantTraits: [],
        recommendations: [],
        confidence_explanation: dominance > 30
            ? 'High confidence - clear constitutional pattern'
            : dominance > 15
                ? 'Medium confidence - moderate constitutional pattern'
                : 'Lower confidence - balanced constitution with multiple dosha influences'
    };

    return {
        percentages,
        constitution,
        confidence,
        analysis,
        datasetBased: false,
        trainingSamples: 0
    };
}

// Validate the structure and numbers from ML results
function isValidMlResults(mlResults) {
    if (!mlResults || !mlResults.percentages) return false;
    const p = mlResults.percentages;
    const values = [p.vata, p.pitta, p.kapha];
    if (values.some(v => typeof v !== 'number' || Number.isNaN(v))) return false;
    if (!mlResults.constitution || typeof mlResults.constitution !== 'string') return false;
    return true;
}

function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');

    const doshaColors = {
        vata: '#2E8B57',
        pitta: '#DAA520',
        kapha: '#DC143C'
    };

    const doshaDescriptions = {
        vata: 'Air and space elements. Governs movement, breathing, and nervous system.',
        pitta: 'Fire and water elements. Governs digestion, metabolism, and transformation.',
        kapha: 'Earth and water elements. Governs structure, immunity, and stability.'
    };

    let resultsHTML = `
        <div class="stats-dashboard">
            <h3>📊 Your Ayurvedic Profile (Dataset-Trained ML Model)</h3>
            <p class="ml-info">✨ Results based on ${results.trainingSamples} training samples</p>
        </div>
    `;

    // Display dosha cards
    Object.entries(results.dosha_percentages).forEach(([dosha, percentage]) => {
        const confidenceClass = percentage > 60 ? 'high' : percentage > 40 ? 'medium' : 'low';

        resultsHTML += `
            <div class="dosha-card" style="border-left-color: ${doshaColors[dosha]};">
                <div class="dosha-header">
                    <h3 class="dosha-name">${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h3>
                    <div class="dosha-percentage confidence-${confidenceClass}">
                        ${percentage}%
                    </div>
                </div>
                <div class="dosha-progress">
                    <div class="progress-bar" style="width: ${percentage}%; background: ${doshaColors[dosha]};"></div>
                </div>
                <p class="dosha-description">${doshaDescriptions[dosha]}</p>
            </div>
        `;
    });

    // Constitution insight
    resultsHTML += `
        <div class="recommendation-card-default">
            <div class="card-header">
                <span class="card-icon">🎯</span>
                <h4 class="card-title">Constitution: ${results.constitution}</h4>
            </div>
            <div class="card-content">
                Your constitution analysis shows <strong>${results.constitution}</strong> with ${results.confidence} confidence. 
                ${results.analysis.confidence_explanation}
                <br><br>
                <strong>Dominant Traits:</strong> ${results.analysis.dominantTraits.join(', ')}
            </div>
        </div>
    `;

    resultsContent.innerHTML = resultsHTML;
    resultsSection.style.display = 'block';
    }

// Render Diet Plan page content with fallback to localStorage
function loadDietPlan() {
    const dietContent = document.getElementById('diet-content');
    if (!dietContent) return;

    // Fallback: try to hydrate currentUser from localStorage
    if (!currentUser) {
        try {
            const saved = localStorage.getItem('ayurvedic_prakriti_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.currentUser) currentUser = parsed.currentUser;
            }
        } catch (e) { /* ignore */ }
    }

    if (!currentUser) {
        dietContent.innerHTML = '<p>Please complete the assessment first to get personalized diet recommendations.</p>';
        return;
    }

    const dosha = currentUser.primary_dosha;
    const recommendations = dietaryRecommendations[dosha];
    if (!recommendations) {
        dietContent.innerHTML = '<p>Unable to load recommendations. Please try again.</p>';
        return;
    }

    let dietHTML = `
        <div class="diet-planner-header">
            <h3>🍽️ Complete Meal Planning System for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h3>
            <p class="dosha-description">${recommendations.description}</p>
            <div class="planner-controls">
                <button onclick="generateDailyMealPlan()" class="btn-primary">📅 Daily Meal Plan</button>
                <button onclick="generateWeeklyMealPlan()" class="btn-secondary">📆 Weekly Plan</button>
                <button onclick="generateShoppingList()" class="btn-accent">🛒 Shopping List</button>
                <button onclick="generateSeasonalMenu()" class="btn-lifestyle">🌿 Seasonal Menu</button>
            </div>
        </div>
        <div id="meal-plan-display"></div>
        <div class="steps-grid">
            <div class="recommendation-card-diet">
                <div class="card-header">
                    <span class="card-icon">✅</span>
                    <h4 class="card-title">Foods to Favor</h4>
                </div>
                <div class="card-content">
                    <ul>
                        ${recommendations.foods_to_eat.map(food => `<li>• ${food}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">❌</span>
                    <h4 class="card-title">Foods to Avoid</h4>
                </div>
                <div class="card-content">
                    <ul>
                        ${recommendations.foods_to_avoid.map(food => `<li>• ${food}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="recommendation-card-lifestyle">
                <div class="card-header">
                    <span class="card-icon">🌿</span>
                    <h4 class="card-title">Therapeutic Herbs & Spices</h4>
                </div>
                <div class="card-content">
                    <ul>
                        ${getTherapeuticHerbs(dosha).map(herb => `<li>• ${herb}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    dietContent.innerHTML = dietHTML;
}

// Render Lifestyle page content with fallback to localStorage
function loadLifestyleRecommendations() {
    const lifestyleContent = document.getElementById('lifestyle-content');
    if (!lifestyleContent) return;

    if (!currentUser) {
        try {
            const saved = localStorage.getItem('ayurvedic_prakriti_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.currentUser) currentUser = parsed.currentUser;
            }
        } catch (e) { /* ignore */ }
    }

    if (!currentUser) {
        lifestyleContent.innerHTML = '<p>Please complete the assessment first to get personalized lifestyle recommendations.</p>';
        return;
    }

    const dosha = currentUser.primary_dosha;
    const recommendations = window.lifestyleRecommendations ? window.lifestyleRecommendations[dosha] : null;
    if (!recommendations) {
        lifestyleContent.innerHTML = '<p>Unable to load recommendations. Please try again.</p>';
        return;
    }

    let lifestyleHTML = `
        <div class="lifestyle-planner-header">
            <h3>🏃 Complete Lifestyle Planning System</h3>
            <div class="planner-controls">
                <button onclick="generateExercisePlan()" class="btn-primary">💪 Exercise Plan</button>
                <button onclick="generateDailyRoutine()" class="btn-secondary">🌅 Daily Routine</button>
                <button onclick="generateStressManagement()" class="btn-accent">🧘 Stress Management</button>
                <button onclick="generateSleepPlan()" class="btn-lifestyle">😴 Sleep Optimization</button>
            </div>
        </div>
        <div id="lifestyle-plan-display"></div>
        <div class="steps-grid">
    `;

    const categories = [
        { key: 'exercise', icon: '🏃', title: 'Exercise & Movement', type: 'diet' },
        { key: 'sleep', icon: '😴', title: 'Sleep & Rest', type: 'default' },
        { key: 'stress_management', icon: '🧘', title: 'Stress Management', type: 'lifestyle' },
        { key: 'daily_routine', icon: '🌅', title: 'Daily Routine', type: 'lifestyle' }
    ];

    categories.forEach(category => {
        lifestyleHTML += `
            <div class="recommendation-card-${category.type}">
                <div class="card-header">
                    <span class="card-icon">${category.icon}</span>
                    <h4 class="card-title">${category.title}</h4>
                </div>
                <div class="card-content">
                    • ${recommendations[category.key]}
                </div>
            </div>
        `;
    });

    lifestyleHTML += '</div>';
    lifestyleContent.innerHTML = lifestyleHTML;
}

    // updateProgress function centralized in assessment.js

    // (Removed corrupted duplicate processAssessment block with embedded HTML)

function loadProgressData() {
    const progressContent = document.getElementById('progress-content');

    if (assessmentHistory.length === 0) {
        progressContent.innerHTML = '<p>Take multiple assessments over time to track your progress.</p>';
        return;
    }

    let progressHTML = `
        <div class="stats-dashboard">
            <h3>📊 Your Wellness Journey</h3>
        </div>
        
        <div class="steps-grid">
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Total Assessments</h4>
                </div>
                <div class="card-content">
                    ${assessmentHistory.length} completed evaluations
                </div>
            </div>
            
            <div class="recommendation-card-diet">
                <div class="card-header">
                    <span class="card-icon">📅</span>
                    <h4 class="card-title">Latest Assessment</h4>
                </div>
                <div class="card-content">
                    ${currentUser ? new Date(currentUser.timestamp).toLocaleDateString() : 'No data'}
                </div>
            </div>
            
            <div class="recommendation-card-lifestyle">
                <div class="card-header">
                    <span class="card-icon">🎯</span>
                    <h4 class="card-title">Current Dosha</h4>
                </div>
                <div class="card-content">
                    ${currentUser ? currentUser.primary_dosha.charAt(0).toUpperCase() + currentUser.primary_dosha.slice(1) : 'Unknown'}
                </div>
            </div>
        </div>
        
        <h3>📋 Assessment History</h3>
    `;

    // Show last 5 assessments
    const recentAssessments = assessmentHistory.slice(-5).reverse();
    recentAssessments.forEach((assessment, index) => {
        progressHTML += `
            <div class="dosha-card">
                <div class="dosha-header">
                    <h3 class="dosha-name">Assessment ${assessmentHistory.length - index}</h3>
                    <div class="dosha-percentage">
                        ${new Date(assessment.timestamp).toLocaleDateString()}
                    </div>
                </div>
                <div class="card-content">
                    <strong>Primary Dosha:</strong> ${assessment.primary_dosha.charAt(0).toUpperCase() + assessment.primary_dosha.slice(1)}<br>
                    <strong>Confidence:</strong> ${(assessment.confidence * 100).toFixed(1)}%
                </div>
            </div>
        `;
    });

    progressContent.innerHTML = progressHTML;
}

function saveUserData() {
    const userData = {
        currentUser: currentUser,
        assessmentHistory: assessmentHistory,
        lastUpdated: new Date()
    };

    localStorage.setItem('ayurvedic_prakriti_data', JSON.stringify(userData));
}

function loadUserData() {
    const savedData = localStorage.getItem('ayurvedic_prakriti_data');

    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            currentUser = userData.currentUser;
            assessmentHistory = userData.assessmentHistory || [];
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

function updateDataStatus() {
    const statusElement = document.getElementById('data-status');

    if (assessmentHistory.length > 0) {
        statusElement.innerHTML = `
            <p style="color: #28a745;">✅ ${assessmentHistory.length} assessments saved</p>
            <small>Latest: ${currentUser ? new Date(currentUser.timestamp).toLocaleDateString() : 'Unknown'}</small>
        `;
    } else {
        statusElement.innerHTML = '<p>No saved data yet</p>';
    }
}

function exportData() {
    if (assessmentHistory.length === 0) {
        alert('No data to export. Please complete an assessment first.');
        return;
    }

    const exportData = {
        currentUser: currentUser,
        assessmentHistory: assessmentHistory,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `prakriti_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        currentUser = null;
        assessmentHistory = [];
        localStorage.removeItem('ayurvedic_prakriti_data');
        updateDataStatus();

        // Reset forms and content
        document.getElementById('assessment-form').reset();
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('diet-content').innerHTML = '<p>Please complete the assessment first to get personalized diet recommendations.</p>';
        document.getElementById('lifestyle-content').innerHTML = '<p>Please complete the assessment first to get personalized lifestyle recommendations.</p>';
        document.getElementById('progress-content').innerHTML = '<p>Take multiple assessments over time to track your progress.</p>';

        updateProgress();
        alert('All data has been cleared successfully!');
    }
}

// AI Assistant Functions
function setupGeminiAPI() {
    const apiKey = document.getElementById('api-key-input').value.trim();

    if (!apiKey) {
        alert('Please enter your Gemini API key');
        return;
    }

    geminiApiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);

    // Hide setup and show features
    document.getElementById('api-setup').style.display = 'none';
    document.getElementById('ai-features').style.display = 'block';

    // Initialize chat
    initializeChat();

    // Load insights if user has assessment data
    if (currentUser) {
        loadPersonalizedInsights();
    }
}

function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="chat-message ai">
            <strong>🤖 AI Assistant:</strong><br>
            Hello! I'm your Ayurvedic AI assistant. I can help you with:
            <ul>
                <li>Understanding your dosha and constitution</li>
                <li>Personalized diet and lifestyle recommendations</li>
                <li>Symptom analysis from an Ayurvedic perspective</li>
                <li>General Ayurvedic wellness guidance</li>
            </ul>
            How can I assist you today?
        </div>
    `;
}

function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();

    if (!message) return;

    const chatMessages = document.getElementById('chat-messages');

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `<strong>You:</strong><br>${message}`;
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'chat-message ai';
    loadingMessage.innerHTML = `<strong>🤖 AI Assistant:</strong><br><span class="loading-spinner"></span> Thinking...`;
    chatMessages.appendChild(loadingMessage);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await callGeminiAPI(message, 'chat');

        // Replace loading message with response
        loadingMessage.innerHTML = `<strong>🤖 AI Assistant:</strong><br>${response}`;

    } catch (error) {
        loadingMessage.innerHTML = `<strong>🤖 AI Assistant:</strong><br><div class="error-message">Sorry, I encountered an error. Please check your API key and try again.</div>`;
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function analyzeSymptoms() {
    const symptomsInput = document.getElementById('symptoms-input');
    const symptoms = symptomsInput.value.trim();

    if (!symptoms) {
        alert('Please describe your symptoms first');
        return;
    }

    const resultDiv = document.getElementById('symptoms-result');
    resultDiv.innerHTML = '<div class="loading-spinner"></div> Analyzing your symptoms...';
    resultDiv.classList.add('show');

    try {
        const userContext = currentUser ? `User's primary dosha: ${currentUser.primary_dosha}` : '';
        const prompt = `Analyze these symptoms from an Ayurvedic perspective: "${symptoms}". ${userContext}
        
        Please provide:
        1. Possible dosha imbalances
        2. Ayurvedic recommendations for diet and lifestyle
        3. Suggested herbs or remedies`;

        const response = await callGeminiAPI(prompt, 'symptoms');
        resultDiv.innerHTML = `<h4>🩺 Ayurvedic Analysis</h4>${response}`;

    } catch (error) {
        resultDiv.innerHTML = '<div class="error-message">Error analyzing symptoms. Please check your API key and try again.</div>';
    }
}

async function generateInsights() {
    if (!currentUser) {
        alert('Please complete the assessment first to get personalized insights');
        return;
    }

    const insightsContent = document.getElementById('insights-content');
    insightsContent.innerHTML = '<div class="loading-spinner"></div> Generating personalized insights...';

    try {
        const prompt = `Based on this Ayurvedic assessment result:
        - Primary Dosha: ${currentUser.primary_dosha}
        - Dosha Percentages: Vata ${currentUser.dosha_percentages.vata.toFixed(1)}%, Pitta ${currentUser.dosha_percentages.pitta.toFixed(1)}%, Kapha ${currentUser.dosha_percentages.kapha.toFixed(1)}%
        - Confidence: ${(currentUser.confidence * 100).toFixed(1)}%
        
        Please provide detailed personalized insights including:
        1. Deep analysis of their constitution
        2. Specific dietary recommendations
        3. Lifestyle practices for balance
        4. Seasonal adjustments
        5. Potential health tendencies to watch for
        6. Meditation and yoga practices suitable for their dosha
        
        Make it comprehensive and actionable.`;

        const response = await callGeminiAPI(prompt, 'insights');

        insightsContent.innerHTML = `
            <div class="insight-card">
                <h4>🎯 Your Personalized Ayurvedic Insights</h4>
                ${response}
            </div>
        `;

    } catch (error) {
        insightsContent.innerHTML = '<div class="error-message">Error generating insights. Please check your API key and try again.</div>';
    }
}

async function callGeminiAPI(prompt, context) {
    if (!geminiApiKey) {
        throw new Error('API key not set');
    }

    // Try API call first, fallback to local responses if it fails
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

        // Add context-specific instructions
        let systemPrompt = `You are an expert Ayurvedic practitioner and wellness advisor. Provide helpful, accurate information about Ayurveda, doshas, diet, and lifestyle.`;

        if (context === 'chat') {
            systemPrompt += ` Keep responses conversational and helpful.`;
        } else if (context === 'symptoms') {
            systemPrompt += ` Focus on Ayurvedic perspective of symptoms and natural remedies.`;
        } else if (context === 'insights') {
            systemPrompt += ` Provide detailed, personalized insights based on the user's dosha assessment.`;
        }

        const fullPrompt = `${systemPrompt}\n\nUser query: ${prompt}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.log('API call failed, using fallback response:', error);
        // Fallback to local intelligent responses
        return generateFallbackResponse(prompt, context);
    }
}

function generateFallbackResponse(prompt, context) {
    const userDosha = currentUser ? currentUser.primary_dosha : null;

    if (context === 'insights' && currentUser) {
        return generatePersonalizedInsights(currentUser);
    } else if (context === 'symptoms') {
        return generateSymptomAnalysis(prompt, userDosha);
    } else if (context === 'chat') {
        return generateChatResponse(prompt, userDosha);
    }

    return "I'm here to help with Ayurvedic guidance! Please ask me about doshas, diet, lifestyle, or wellness practices.";
}

function generatePersonalizedInsights(userData) {
    const dosha = userData.primary_dosha;
    const percentage = userData.dosha_percentages[dosha].toFixed(1);

    const insights = {
        vata: {
            constitution: "As a Vata-dominant individual, you embody the qualities of air and space. You're naturally creative, energetic, and quick-thinking, but may experience variability in energy, mood, and digestion.",
            diet: "Focus on warm, moist, and grounding foods. Favor cooked grains like rice and oats, root vegetables, nuts, seeds, and healthy oils. Avoid cold, dry, and raw foods. Eat regular meals and don't skip breakfast.",
            lifestyle: "Maintain regular routines, get 7-8 hours of sleep, practice gentle yoga or walking, and create a calm environment. Oil massage (abhyanga) is particularly beneficial for you.",
            seasonal: "During autumn and early winter (Vata season), be extra mindful of staying warm, eating nourishing foods, and maintaining consistent routines.",
            practices: "Meditation, pranayama (especially Nadi Shodhana), and restorative yoga help balance your active mind. Journaling can help organize your thoughts."
        },
        pitta: {
            constitution: "As a Pitta-dominant individual, you embody fire and water elements. You're naturally intelligent, focused, and goal-oriented, with strong digestion and metabolism, but may experience intensity and heat-related imbalances.",
            diet: "Choose cooling, sweet, and bitter foods. Favor fresh fruits, leafy greens, coconut, dairy (if tolerated), and cooling spices like coriander and fennel. Avoid spicy, sour, and salty foods.",
            lifestyle: "Avoid overheating through excessive sun exposure or intense exercise. Practice moderation, take regular breaks, and engage in cooling activities like swimming.",
            seasonal: "During summer (Pitta season), focus on staying cool, eating fresh foods, and avoiding excessive heat and intensity in activities.",
            practices: "Cooling pranayama (Sheetali, Sheetkari), moon salutations, and meditation help balance your fiery nature. Spend time in nature, especially near water."
        },
        kapha: {
            constitution: "As a Kapha-dominant individual, you embody earth and water elements. You're naturally calm, stable, and nurturing, with strong immunity and endurance, but may experience sluggishness and weight gain tendencies.",
            diet: "Choose light, warm, and spicy foods. Favor legumes, leafy greens, warming spices, and light fruits. Limit dairy, heavy grains, and sweet foods. Eat your largest meal at midday.",
            lifestyle: "Stay active with vigorous exercise like running or aerobics. Wake early, avoid daytime naps, and seek variety and stimulation in your routine.",
            seasonal: "During late winter and spring (Kapha season), focus on detoxification, lighter foods, and increased physical activity to prevent stagnation.",
            practices: "Energizing pranayama (Bhastrika, Kapalabhati), vigorous yoga styles, and active meditation help balance your naturally calm nature."
        }
    };

    const doshaTips = insights[dosha] || insights.vata;

    return `
        <h4>🎯 Your Personalized Ayurvedic Profile (${percentage}% ${dosha.charAt(0).toUpperCase() + dosha.slice(1)})</h4>
        
        <h5>🧬 Your Constitution</h5>
        <p>${doshaTips.constitution}</p>
        
        <h5>🍽️ Dietary Recommendations</h5>
        <p>${doshaTips.diet}</p>
        
        <h5>🧘 Lifestyle Practices</h5>
        <p>${doshaTips.lifestyle}</p>
        
        <h5>🌱 Seasonal Adjustments</h5>
        <p>${doshaTips.seasonal}</p>
        
        <h5>🧘‍♀️ Recommended Practices</h5>
        <p>${doshaTips.practices}</p>
    `;
}

function generateSymptomAnalysis(symptoms, userDosha) {
    const commonSymptoms = {
        'tired': 'Fatigue may indicate Kapha imbalance. Try energizing practices, lighter foods, and regular exercise.',
        'stress': 'Stress often relates to Vata imbalance. Practice meditation, maintain routines, and eat grounding foods.',
        'digestive': 'Digestive issues can affect all doshas. Eat mindfully, avoid cold drinks with meals, and consider digestive spices.',
        'sleep': 'Sleep problems often indicate Vata imbalance. Create a calming bedtime routine and avoid screens before bed.',
        'headache': 'Headaches may indicate Pitta imbalance. Stay hydrated, avoid excessive heat, and practice cooling techniques.',
        'anxiety': 'Anxiety typically relates to Vata imbalance. Practice grounding activities, oil massage, and regular routines.'
    };

    let analysis = "Based on your symptoms, here's an Ayurvedic perspective:\n\n";

    // Simple keyword matching for common symptoms
    const lowerSymptoms = symptoms.toLowerCase();
    let foundSymptoms = [];

    for (const [symptom, advice] of Object.entries(commonSymptoms)) {
        if (lowerSymptoms.includes(symptom)) {
            foundSymptoms.push(`• ${advice}`);
        }
    }

    if (foundSymptoms.length > 0) {
        analysis += foundSymptoms.join('\n') + '\n\n';
    }

    if (userDosha) {
        analysis += `Given your ${userDosha} constitution, focus on ${userDosha}-balancing practices and diet.\n\n`;
    }

    analysis += "General Recommendations:\n";
    analysis += "• Maintain regular meal times and sleep schedule\n";
    analysis += "• Practice stress-reduction techniques like meditation\n";
    analysis += "• Stay hydrated with warm water\n";
    analysis += "• Consider gentle detox with warm lemon water in the morning\n\n";
    analysis += "💡 Tip: Maintain consistency with these practices for best results.";

    return analysis;
}

function generateChatResponse(prompt, userDosha) {
    const lowerPrompt = prompt.toLowerCase();

    // Diet-related questions
    if (lowerPrompt.includes('diet') || lowerPrompt.includes('food') || lowerPrompt.includes('eat')) {
        if (userDosha === 'vata') {
            return "For Vata constitution, focus on warm, cooked, and nourishing foods. Favor sweet, sour, and salty tastes. Good choices include rice, oats, root vegetables, nuts, and warm milk. Avoid cold, dry, and raw foods.";
        } else if (userDosha === 'pitta') {
            return "For Pitta constitution, choose cooling and calming foods. Favor sweet, bitter, and astringent tastes. Good choices include fresh fruits, leafy greens, coconut, and cooling herbs. Avoid spicy, sour, and salty foods.";
        } else if (userDosha === 'kapha') {
            return "For Kapha constitution, opt for light, warm, and spicy foods. Favor pungent, bitter, and astringent tastes. Good choices include legumes, leafy greens, warming spices, and light fruits. Limit heavy, oily, and sweet foods.";
        }
        return "Diet should be tailored to your dosha. Complete the assessment to get personalized dietary recommendations!";
    }

    // Exercise-related questions
    if (lowerPrompt.includes('exercise') || lowerPrompt.includes('yoga') || lowerPrompt.includes('workout')) {
        if (userDosha === 'vata') {
            return "Vata types benefit from gentle, grounding exercises like walking, swimming, tai chi, and restorative yoga. Avoid excessive or irregular exercise routines.";
        } else if (userDosha === 'pitta') {
            return "Pitta types do well with moderate exercise, especially swimming, cycling, and yoga. Avoid overheating and competitive activities during hot weather.";
        } else if (userDosha === 'kapha') {
            return "Kapha types need vigorous, energizing exercise like running, aerobics, hot yoga, and strength training. Regular, consistent activity is key.";
        }
        return "Exercise recommendations vary by dosha. Take the assessment to discover what's best for your constitution!";
    }

    // Sleep-related questions
    if (lowerPrompt.includes('sleep') || lowerPrompt.includes('insomnia') || lowerPrompt.includes('rest')) {
        return "Good sleep is crucial for all doshas. Create a calming bedtime routine, avoid screens 1 hour before bed, keep your bedroom cool and dark, and try to sleep by 10 PM. Vata types especially benefit from consistent sleep schedules.";
    }

    // Stress-related questions
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety') || lowerPrompt.includes('calm')) {
        return "Stress management in Ayurveda involves balancing your dosha. Try meditation, pranayama (breathing exercises), oil massage, and maintaining regular routines. Vata types are most prone to stress and anxiety.";
    }

    // General dosha questions
    if (lowerPrompt.includes('dosha') || lowerPrompt.includes('constitution') || lowerPrompt.includes('prakriti')) {
        return "Doshas are the three fundamental energies in Ayurveda: Vata (air/space), Pitta (fire/water), and Kapha (earth/water). Everyone has all three, but usually one or two dominate. Take our assessment to discover your unique constitution!";
    }

    // Default response
    return "I'm here to help with Ayurvedic guidance! I can assist with questions about diet, lifestyle, exercise, sleep, stress management, and understanding your dosha. What specific aspect of Ayurvedic wellness would you like to explore?";
}

function loadPersonalizedInsights() {
    const generateBtn = document.getElementById('generate-insights-btn');
    const insightsContent = document.getElementById('insights-content');

    generateBtn.style.display = 'block';
    insightsContent.innerHTML = `
        <div class="insight-card">
            <h4>🎯 Ready for Personalized Insights</h4>
            <p>Your assessment shows you are primarily <strong>${currentUser.primary_dosha.charAt(0).toUpperCase() + currentUser.primary_dosha.slice(1)}</strong> constitution.</p>
            <p>Click "Generate New Insights" to get detailed AI-powered recommendations tailored to your unique dosha profile.</p>
        </div>
    `;
}

// Check AI status (now always ready with permanent API key)
function checkSavedAPIKey() {
    // AI is always ready with permanent API key
    autoEnableAI();
}

// AI Assistant functionality integrated into main showPage function

// Navigation functionality is handled by the main showPage function

// Auto-enable AI features with permanent API key
function autoEnableAI() {
    // Hide API setup section and show AI features directly
    const apiSetup = document.getElementById('api-setup');
    const aiFeatures = document.getElementById('ai-features');

    if (apiSetup && aiFeatures) {
        apiSetup.style.display = 'none';
        aiFeatures.style.display = 'block';

        // Initialize chat
        initializeChat();

        // Load insights if user has assessment data
        if (currentUser) {
            loadPersonalizedInsights();
        }
    }
}

// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile behavior
        if (sidebar.classList.contains('show-mobile')) {
            sidebar.classList.remove('show-mobile');
        } else {
            sidebar.classList.add('show-mobile');
        }
    } else {
        // Desktop behavior
        if (sidebar.classList.contains('collapsed')) {
            // Show sidebar
            sidebar.classList.remove('collapsed');
            body.classList.remove('sidebar-collapsed');
        } else {
            // Hide sidebar
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
        }
    }
}

// Handle window resize
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        // Reset mobile classes when switching to desktop
        sidebar.classList.remove('show-mobile');
        if (!sidebar.classList.contains('collapsed')) {
            body.classList.remove('sidebar-collapsed');
        }
    } else {
        // On mobile, always show toggle button
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('show-mobile');
    }
});

// Advanced Meal Planning System
function generateDailyMealPlan() {
    const dosha = currentUser.primary_dosha;
    const mealPlan = getDailyMealPlan(dosha);

    const displayArea = document.getElementById('meal-plan-display');
    displayArea.innerHTML = `
        <div class="meal-plan-container">
            <h4>🌅 Today's Personalized Meal Plan</h4>
            <div class="meal-timeline">
                ${Object.entries(mealPlan).map(([meal, details]) => `
                    <div class="meal-card">
                        <div class="meal-time">${details.time}</div>
                        <div class="meal-name">${meal}</div>
                        <div class="meal-description">${details.description}</div>
                        <div class="meal-benefits">Benefits: ${details.benefits}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateWeeklyMealPlan() {
    const dosha = currentUser.primary_dosha;
    const weeklyPlan = getWeeklyMealPlan(dosha);

    const displayArea = document.getElementById('meal-plan-display');
    displayArea.innerHTML = `
        <div class="weekly-plan-container">
            <h4>📆 7-Day Meal Planning Schedule</h4>
            <div class="weekly-grid">
                ${weeklyPlan.map((day, index) => `
                    <div class="day-plan">
                        <h5>${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}</h5>
                        <div class="day-meals">
                            <div class="mini-meal">🌅 ${day.breakfast}</div>
                            <div class="mini-meal">☀️ ${day.lunch}</div>
                            <div class="mini-meal">🌙 ${day.dinner}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateShoppingList() {
    const dosha = currentUser.primary_dosha;
    const shoppingList = getShoppingList(dosha);

    const displayArea = document.getElementById('meal-plan-display');
    displayArea.innerHTML = `
        <div class="shopping-list-container">
            <h4>🛒 Personalized Shopping List</h4>
            <div class="shopping-categories">
                ${Object.entries(shoppingList).map(([category, items]) => `
                    <div class="shopping-category">
                        <h5>${category}</h5>
                        <ul class="shopping-items">
                            ${items.map(item => `<li><input type="checkbox"> ${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <button onclick="downloadShoppingList()" class="btn-primary">📱 Download List</button>
        </div>
    `;
}

function generateSeasonalMenu() {
    const dosha = currentUser.primary_dosha;
    const currentSeason = getCurrentSeason();
    const seasonalMenu = getSeasonalMenu(dosha, currentSeason);

    const displayArea = document.getElementById('meal-plan-display');
    displayArea.innerHTML = `
        <div class="seasonal-menu-container">
            <h4>🌿 ${currentSeason} Seasonal Menu</h4>
            <p class="seasonal-description">${seasonalMenu.description}</p>
            <div class="seasonal-recommendations">
                ${seasonalMenu.recommendations.map(rec => `
                    <div class="seasonal-item">
                        <span class="seasonal-icon">${rec.icon}</span>
                        <div class="seasonal-content">
                            <h6>${rec.title}</h6>
                            <p>${rec.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Meal Planning Data
function getDailyMealPlan(dosha) {
    const mealPlans = {
        vata: {
            "Early Morning": {
                time: "6:00 AM",
                description: "Warm water with ginger and lemon",
                benefits: "Stimulates digestion, balances Vata"
            },
            "Breakfast": {
                time: "7:30 AM",
                description: "Warm oatmeal with almonds, dates, and cinnamon",
                benefits: "Grounding, nourishing, easy to digest"
            },
            "Mid-Morning": {
                time: "10:00 AM",
                description: "Herbal tea (ginger or chamomile)",
                benefits: "Maintains warmth, supports digestion"
            },
            "Lunch": {
                time: "12:30 PM",
                description: "Kitchari with ghee, steamed vegetables, and warm chapati",
                benefits: "Complete nutrition, balances all doshas"
            },
            "Afternoon": {
                time: "3:30 PM",
                description: "Warm milk with turmeric and honey",
                benefits: "Calming, anti-inflammatory"
            },
            "Dinner": {
                time: "6:30 PM",
                description: "Vegetable soup with quinoa and fresh herbs",
                benefits: "Light, warm, easy to digest"
            }
        },
        pitta: {
            "Early Morning": {
                time: "6:00 AM",
                description: "Cool water with lime and mint",
                benefits: "Cooling, refreshing, balances Pitta"
            },
            "Breakfast": {
                time: "7:30 AM",
                description: "Fresh fruit salad with coconut and rose water",
                benefits: "Cooling, sweet, energizing"
            },
            "Mid-Morning": {
                time: "10:00 AM",
                description: "Coconut water or cooling herbal tea",
                benefits: "Hydrating, cooling"
            },
            "Lunch": {
                time: "12:30 PM",
                description: "Basmati rice with dal, cucumber raita, and leafy greens",
                benefits: "Cooling, satisfying, complete nutrition"
            },
            "Afternoon": {
                time: "3:30 PM",
                description: "Fresh pomegranate juice",
                benefits: "Cooling, antioxidant-rich"
            },
            "Dinner": {
                time: "6:30 PM",
                description: "Quinoa salad with fresh vegetables and cooling herbs",
                benefits: "Light, cooling, nutritious"
            }
        },
        kapha: {
            "Early Morning": {
                time: "6:00 AM",
                description: "Warm water with honey and black pepper",
                benefits: "Stimulating, metabolism-boosting"
            },
            "Breakfast": {
                time: "7:30 AM",
                description: "Spiced quinoa porridge with berries",
                benefits: "Light, warming, energizing"
            },
            "Mid-Morning": {
                time: "10:00 AM",
                description: "Green tea with ginger",
                benefits: "Stimulating, metabolism-boosting"
            },
            "Lunch": {
                time: "12:30 PM",
                description: "Spicy lentil curry with brown rice and steamed broccoli",
                benefits: "Warming, protein-rich, stimulating"
            },
            "Afternoon": {
                time: "3:30 PM",
                description: "Herbal tea with cinnamon and cardamom",
                benefits: "Warming, digestive"
            },
            "Dinner": {
                time: "6:30 PM",
                description: "Light vegetable stir-fry with quinoa",
                benefits: "Light, warming, easy to digest"
            }
        }
    };

    return mealPlans[dosha] || mealPlans.vata;
}

function getWeeklyMealPlan(dosha) {
    const weeklyPlans = {
        vata: [
            { breakfast: "Warm oatmeal with nuts", lunch: "Kitchari with vegetables", dinner: "Vegetable soup" },
            { breakfast: "Quinoa porridge", lunch: "Rice with dal", dinner: "Steamed vegetables with quinoa" },
            { breakfast: "Warm smoothie", lunch: "Lentil curry", dinner: "Roasted root vegetables" },
            { breakfast: "Chia pudding", lunch: "Vegetable biryani", dinner: "Mung bean soup" },
            { breakfast: "Warm cereal", lunch: "Quinoa salad", dinner: "Butternut squash soup" },
            { breakfast: "Pancakes with fruit", lunch: "Rice and beans", dinner: "Roasted vegetables" },
            { breakfast: "French toast", lunch: "Pasta with vegetables", dinner: "Hearty stew" }
        ],
        pitta: [
            { breakfast: "Fresh fruit bowl", lunch: "Cooling rice salad", dinner: "Cucumber soup" },
            { breakfast: "Coconut yogurt", lunch: "Quinoa tabbouleh", dinner: "Green salad" },
            { breakfast: "Smoothie bowl", lunch: "Cool pasta salad", dinner: "Gazpacho" },
            { breakfast: "Overnight oats", lunch: "Rice with cooling herbs", dinner: "Vegetable sushi" },
            { breakfast: "Fruit salad", lunch: "Cooling curry", dinner: "Raw vegetables" },
            { breakfast: "Chia pudding", lunch: "Cold soup", dinner: "Light stir-fry" },
            { breakfast: "Granola with berries", lunch: "Cooling grain bowl", dinner: "Steamed fish" }
        ],
        kapha: [
            { breakfast: "Spiced quinoa", lunch: "Spicy lentils", dinner: "Light vegetable curry" },
            { breakfast: "Green smoothie", lunch: "Warming soup", dinner: "Grilled vegetables" },
            { breakfast: "Buckwheat pancakes", lunch: "Spicy rice", dinner: "Steamed broccoli" },
            { breakfast: "Protein smoothie", lunch: "Bean chili", dinner: "Roasted cauliflower" },
            { breakfast: "Quinoa bowl", lunch: "Spicy stir-fry", dinner: "Light salad" },
            { breakfast: "Oatmeal with spices", lunch: "Warming curry", dinner: "Grilled tofu" },
            { breakfast: "Fruit and nuts", lunch: "Spicy soup", dinner: "Steamed vegetables" }
        ]
    };

    return weeklyPlans[dosha] || weeklyPlans.vata;
}

function getShoppingList(dosha) {
    const shoppingLists = {
        vata: {
            "🥬 Vegetables": ["Sweet potatoes", "Carrots", "Beets", "Squash", "Avocados", "Cooked leafy greens"],
            "🍎 Fruits": ["Bananas", "Dates", "Figs", "Grapes", "Mangoes", "Oranges"],
            "🌾 Grains": ["Oats", "Rice", "Quinoa", "Wheat"],
            "🥜 Proteins": ["Almonds", "Walnuts", "Mung beans", "Tofu", "Warm milk"],
            "🧄 Spices": ["Ginger", "Cinnamon", "Cardamom", "Cumin", "Fennel"],
            "🥥 Oils": ["Sesame oil", "Ghee", "Olive oil"]
        },
        pitta: {
            "🥬 Vegetables": ["Cucumber", "Leafy greens", "Broccoli", "Cauliflower", "Zucchini", "Bell peppers"],
            "🍎 Fruits": ["Coconut", "Pomegranate", "Grapes", "Melons", "Pears", "Apples"],
            "🌾 Grains": ["Basmati rice", "Barley", "Oats", "Quinoa"],
            "🥜 Proteins": ["Mung beans", "Chickpeas", "Almonds", "Coconut", "Cool dairy"],
            "🧄 Spices": ["Coriander", "Fennel", "Mint", "Dill", "Turmeric"],
            "🥥 Oils": ["Coconut oil", "Sunflower oil", "Ghee"]
        },
        kapha: {
            "🥬 Vegetables": ["Leafy greens", "Broccoli", "Cauliflower", "Cabbage", "Radishes", "Sprouts"],
            "🍎 Fruits": ["Apples", "Pears", "Berries", "Pomegranates", "Cranberries"],
            "🌾 Grains": ["Quinoa", "Barley", "Buckwheat", "Millet"],
            "🥜 Proteins": ["Lentils", "Chickpeas", "Tofu", "Light fish"],
            "🧄 Spices": ["Ginger", "Black pepper", "Cayenne", "Turmeric", "Cinnamon"],
            "🥥 Oils": ["Mustard oil", "Sunflower oil", "Small amounts of ghee"]
        }
    };

    return shoppingLists[dosha] || shoppingLists.vata;
}

function getTherapeuticHerbs(dosha) {
    const herbs = {
        vata: ["Ashwagandha - for stress and energy", "Brahmi - for mental clarity", "Triphala - for digestion", "Ginger - for warmth", "Cinnamon - for circulation"],
        pitta: ["Aloe Vera - for cooling", "Neem - for purification", "Coriander - for digestion", "Rose - for emotional balance", "Fennel - for cooling digestion"],
        kapha: ["Trikatu - for metabolism", "Guggul - for weight management", "Turmeric - for inflammation", "Ginger - for digestion", "Black pepper - for circulation"]
    };

    return herbs[dosha] || herbs.vata;
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
}

function getSeasonalMenu(dosha, season) {
    const seasonalMenus = {
        Spring: {
            vata: {
                description: "Spring is a time of renewal. Focus on light, warming foods to balance the cool, damp qualities of the season.",
                recommendations: [
                    { icon: "🌱", title: "Fresh Greens", description: "Incorporate bitter greens like dandelion and arugula" },
                    { icon: "🌿", title: "Detox Foods", description: "Light soups and steamed vegetables for cleansing" },
                    { icon: "☕", title: "Warming Teas", description: "Ginger, cinnamon, and cardamom teas" }
                ]
            },
            pitta: {
                description: "Spring's warming energy can aggravate Pitta. Focus on cooling, bitter foods to maintain balance.",
                recommendations: [
                    { icon: "🥗", title: "Fresh Salads", description: "Raw vegetables with cooling herbs like mint and cilantro" },
                    { icon: "🍃", title: "Bitter Greens", description: "Dandelion, kale, and other bitter leafy greens" },
                    { icon: "🌸", title: "Floral Teas", description: "Rose, hibiscus, and chamomile teas" }
                ]
            },
            kapha: {
                description: "Spring is Kapha season. Focus on light, spicy, and bitter foods to counteract heaviness.",
                recommendations: [
                    { icon: "🌶️", title: "Spicy Foods", description: "Add cayenne, black pepper, and ginger to meals" },
                    { icon: "🥬", title: "Light Vegetables", description: "Steamed greens and cruciferous vegetables" },
                    { icon: "🍵", title: "Stimulating Teas", description: "Green tea, ginger tea, and spiced chai" }
                ]
            }
        },
        Summer: {
            vata: {
                description: "Summer's heat can dry out Vata. Focus on cooling, hydrating foods while maintaining warmth in preparation.",
                recommendations: [
                    { icon: "🥒", title: "Cooling Foods", description: "Cucumber, melons, and coconut water" },
                    { icon: "🥛", title: "Hydrating Drinks", description: "Warm milk with cooling spices like cardamom" },
                    { icon: "🌾", title: "Grounding Grains", description: "Rice, oats, and wheat to maintain stability" }
                ]
            },
            pitta: {
                description: "Summer is Pitta season. Focus heavily on cooling, sweet, and bitter foods.",
                recommendations: [
                    { icon: "🍉", title: "Cooling Fruits", description: "Watermelon, coconut, grapes, and melons" },
                    { icon: "🥗", title: "Raw Foods", description: "Fresh salads, raw vegetables, and cooling herbs" },
                    { icon: "🧊", title: "Cool Drinks", description: "Coconut water, mint tea, and rose water" }
                ]
            },
            kapha: {
                description: "Summer's heat helps balance Kapha's cool nature. Maintain light, fresh foods.",
                recommendations: [
                    { icon: "🍓", title: "Light Fruits", description: "Berries, apples, and pears" },
                    { icon: "🥗", title: "Fresh Salads", description: "Raw vegetables with warming spices" },
                    { icon: "🌿", title: "Fresh Herbs", description: "Basil, oregano, and other aromatic herbs" }
                ]
            }
        },
        Fall: {
            vata: {
                description: "Fall is Vata season with dry, cool, windy qualities. Focus on warm, moist, grounding foods.",
                recommendations: [
                    { icon: "🍠", title: "Root Vegetables", description: "Sweet potatoes, carrots, beets, and squash" },
                    { icon: "🍲", title: "Warm Soups", description: "Nourishing broths and hearty stews" },
                    { icon: "🥜", title: "Nuts & Seeds", description: "Almonds, walnuts, and sesame seeds for grounding" }
                ]
            },
            pitta: {
                description: "Fall's cool air helps balance Pitta's heat. Focus on sweet, grounding foods.",
                recommendations: [
                    { icon: "🍎", title: "Sweet Fruits", description: "Apples, pears, and pomegranates" },
                    { icon: "🌾", title: "Warming Grains", description: "Rice, oats, and quinoa with mild spices" },
                    { icon: "🥛", title: "Warm Milk", description: "Golden milk with turmeric and cardamom" }
                ]
            },
            kapha: {
                description: "Fall's dry quality helps balance Kapha's moisture. Maintain warming, light foods.",
                recommendations: [
                    { icon: "🌶️", title: "Warming Spices", description: "Ginger, cinnamon, and cloves in meals" },
                    { icon: "🍵", title: "Hot Teas", description: "Spiced teas and warming herbal blends" },
                    { icon: "🥗", title: "Light Meals", description: "Avoid heavy, oily foods; focus on steamed vegetables" }
                ]
            }
        },
        Winter: {
            vata: {
                description: "Winter's cold, dry qualities strongly aggravate Vata. Focus on warm, oily, heavy foods.",
                recommendations: [
                    { icon: "🍲", title: "Hearty Stews", description: "Warm, oily, well-cooked meals with ghee" },
                    { icon: "🥛", title: "Warm Drinks", description: "Hot milk, herbal teas, and warming broths" },
                    { icon: "🌰", title: "Nuts & Oils", description: "Sesame oil, almonds, and warming fats" }
                ]
            },
            pitta: {
                description: "Winter's cold helps balance Pitta naturally. Enjoy warming foods in moderation.",
                recommendations: [
                    { icon: "🍯", title: "Sweet Foods", description: "Natural sweeteners and sweet fruits" },
                    { icon: "🌾", title: "Warming Grains", description: "Rice, wheat, and oats with mild warming spices" },
                    { icon: "☕", title: "Warm Beverages", description: "Herbal teas and warm milk with gentle spices" }
                ]
            },
            kapha: {
                description: "Winter can increase Kapha's heavy, cold qualities. Focus on light, warming, spicy foods.",
                recommendations: [
                    { icon: "🔥", title: "Spicy Foods", description: "Hot, spicy meals to counter cold and heaviness" },
                    { icon: "🍵", title: "Stimulating Teas", description: "Ginger, cinnamon, and black pepper teas" },
                    { icon: "🥗", title: "Light Meals", description: "Avoid heavy foods; focus on warming, light options" }
                ]
            }
        }
    };

    return seasonalMenus[season][dosha] || seasonalMenus[season].vata;
}

function downloadShoppingList() {
    const dosha = currentUser.primary_dosha;
    const shoppingList = getShoppingList(dosha);

    let listText = `Shopping List for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)} Constitution\n\n`;

    Object.entries(shoppingList).forEach(([category, items]) => {
        listText += `${category}\n`;
        items.forEach(item => {
            listText += `☐ ${item}\n`;
        });
        listText += '\n';
    });

    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dosha}-shopping-list.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Advanced Lifestyle Planning System
function generateExercisePlan() {
    const dosha = currentUser.primary_dosha;
    const exercisePlan = getExercisePlan(dosha);

    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="exercise-plan-container">
            <h4>💪 Personalized Exercise Plan for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${exercisePlan.description}</p>
            
            <div class="exercise-schedule">
                <h5>📅 Weekly Exercise Schedule</h5>
                ${exercisePlan.weeklySchedule.map((day, index) => `
                    <div class="exercise-day">
                        <div class="day-name">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}</div>
                        <div class="exercise-details">
                            <div class="exercise-type">${day.type}</div>
                            <div class="exercise-duration">Duration: ${day.duration}</div>
                            <div class="exercise-intensity">Intensity: ${day.intensity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="exercise-tips">
                <h5>💡 Exercise Tips</h5>
                <ul>
                    ${exercisePlan.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateDailyRoutine() {
    const dosha = currentUser.primary_dosha;
    const routine = getDailyRoutine(dosha);

    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="routine-container">
            <h4>🌅 Optimal Daily Routine for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <div class="routine-timeline">
                ${routine.map(activity => `
                    <div class="routine-item">
                        <div class="routine-time">${activity.time}</div>
                        <div class="routine-activity">
                            <span class="activity-icon">${activity.icon}</span>
                            <div class="activity-details">
                                <h6>${activity.activity}</h6>
                                <p>${activity.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateStressManagement() {
    const dosha = currentUser.primary_dosha;
    const stressManagement = getStressManagement(dosha);

    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="stress-management-container">
            <h4>🧘 Stress Management Plan for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${stressManagement.description}</p>
            
            <div class="stress-techniques">
                ${stressManagement.techniques.map(technique => `
                    <div class="technique-card">
                        <div class="technique-header">
                            <span class="technique-icon">${technique.icon}</span>
                            <h5>${technique.name}</h5>
                        </div>
                        <div class="technique-content">
                            <p>${technique.description}</p>
                            <div class="technique-steps">
                                <strong>How to practice:</strong>
                                <ol>
                                    ${technique.steps.map(step => `<li>${step}</li>`).join('')}
                                </ol>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateSleepPlan() {
    const dosha = currentUser.primary_dosha;
    const sleepPlan = getSleepPlan(dosha);

    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="sleep-plan-container">
            <h4>😴 Sleep Optimization Plan for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${sleepPlan.description}</p>
            
            <div class="sleep-schedule">
                <h5>🕘 Recommended Sleep Schedule</h5>
                <div class="sleep-times">
                    <div class="sleep-time">
                        <span class="time-icon">🌙</span>
                        <div>
                            <strong>Bedtime:</strong> ${sleepPlan.bedtime}
                        </div>
                    </div>
                    <div class="sleep-time">
                        <span class="time-icon">🌅</span>
                        <div>
                            <strong>Wake time:</strong> ${sleepPlan.wakeTime}
                        </div>
                    </div>
                    <div class="sleep-time">
                        <span class="time-icon">⏰</span>
                        <div>
                            <strong>Duration:</strong> ${sleepPlan.duration}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sleep-tips">
                <h5>💤 Sleep Enhancement Tips</h5>
                <ul>
                    ${sleepPlan.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

// Exercise Planning Data
function getExercisePlan(dosha) {
    const exercisePlans = {
        vata: {
            description: "Vata types benefit from gentle, grounding exercises that build stability and strength without overstimulation.",
            weeklySchedule: [
                { type: "Gentle Yoga", duration: "45 minutes", intensity: "Low-Medium" },
                { type: "Walking/Light Jogging", duration: "30 minutes", intensity: "Low" },
                { type: "Strength Training", duration: "30 minutes", intensity: "Medium" },
                { type: "Tai Chi/Qigong", duration: "45 minutes", intensity: "Low" },
                { type: "Swimming", duration: "30 minutes", intensity: "Medium" },
                { type: "Restorative Yoga", duration: "60 minutes", intensity: "Low" },
                { type: "Rest/Gentle Stretching", duration: "20 minutes", intensity: "Low" }
            ],
            tips: [
                "Exercise at the same time daily for routine",
                "Avoid overexertion - listen to your body",
                "Focus on grounding poses and movements",
                "Exercise indoors during windy weather",
                "Include warm-up and cool-down periods"
            ]
        },
        pitta: {
            description: "Pitta types thrive with moderate, cooling exercises that channel their natural intensity without overheating.",
            weeklySchedule: [
                { type: "Swimming", duration: "45 minutes", intensity: "Medium-High" },
                { type: "Cycling", duration: "40 minutes", intensity: "Medium" },
                { type: "Yoga (cooling poses)", duration: "45 minutes", intensity: "Medium" },
                { type: "Tennis/Racquet Sports", duration: "45 minutes", intensity: "High" },
                { type: "Hiking", duration: "60 minutes", intensity: "Medium" },
                { type: "Pilates", duration: "45 minutes", intensity: "Medium" },
                { type: "Gentle Yoga/Meditation", duration: "30 minutes", intensity: "Low" }
            ],
            tips: [
                "Exercise during cooler parts of the day",
                "Stay hydrated and avoid overheating",
                "Choose non-competitive activities when stressed",
                "Exercise outdoors in shade or cool weather",
                "Include cooling pranayama (breathing exercises)"
            ]
        },
        kapha: {
            description: "Kapha types need vigorous, stimulating exercises to boost metabolism and energy levels.",
            weeklySchedule: [
                { type: "High-Intensity Interval Training", duration: "30 minutes", intensity: "High" },
                { type: "Running/Jogging", duration: "45 minutes", intensity: "High" },
                { type: "Power Yoga", duration: "60 minutes", intensity: "High" },
                { type: "Weight Training", duration: "45 minutes", intensity: "High" },
                { type: "Dance/Aerobics", duration: "45 minutes", intensity: "High" },
                { type: "Rock Climbing/Boxing", duration: "60 minutes", intensity: "High" },
                { type: "Active Recovery (hiking)", duration: "60 minutes", intensity: "Medium" }
            ],
            tips: [
                "Exercise early morning to boost energy",
                "Choose challenging, varied workouts",
                "Exercise even when you don't feel like it",
                "Include competitive or group activities",
                "Focus on building heat and sweating"
            ]
        }
    };

    return exercisePlans[dosha] || exercisePlans.vata;
}

function getDailyRoutine(dosha) {
    const routines = {
        vata: [
            { time: "6:00 AM", icon: "🌅", activity: "Wake Up", description: "Rise early but gently, avoid rushing" },
            { time: "6:15 AM", icon: "🧘", activity: "Meditation", description: "5-10 minutes of grounding meditation" },
            { time: "6:30 AM", icon: "🚿", activity: "Warm Shower", description: "Warm water to soothe the nervous system" },
            { time: "7:00 AM", icon: "🍵", activity: "Warm Drink", description: "Herbal tea or warm water with ginger" },
            { time: "7:30 AM", icon: "🍽️", activity: "Breakfast", description: "Warm, nourishing meal" },
            { time: "12:30 PM", icon: "🥗", activity: "Lunch", description: "Largest meal of the day, eaten mindfully" },
            { time: "3:00 PM", icon: "☕", activity: "Afternoon Tea", description: "Warm herbal tea and light snack" },
            { time: "6:30 PM", icon: "🍲", activity: "Dinner", description: "Light, warm, easy to digest" },
            { time: "8:00 PM", icon: "📚", activity: "Quiet Activities", description: "Reading, gentle music, or light conversation" },
            { time: "9:30 PM", icon: "🛁", activity: "Evening Routine", description: "Warm bath or self-massage with oil" },
            { time: "10:00 PM", icon: "😴", activity: "Sleep", description: "Regular bedtime for nervous system balance" }
        ],
        pitta: [
            { time: "6:00 AM", icon: "🌅", activity: "Wake Up", description: "Rise early to avoid midday heat" },
            { time: "6:15 AM", icon: "🧘", activity: "Meditation", description: "Cooling meditation or pranayama" },
            { time: "6:45 AM", icon: "🚿", activity: "Cool Shower", description: "Cool water to balance body temperature" },
            { time: "7:15 AM", icon: "🥤", activity: "Cool Drink", description: "Room temperature water or coconut water" },
            { time: "7:30 AM", icon: "🍽️", activity: "Breakfast", description: "Fresh, cooling foods" },
            { time: "12:00 PM", icon: "🥗", activity: "Lunch", description: "Substantial meal with cooling foods" },
            { time: "3:00 PM", icon: "🥥", activity: "Cooling Break", description: "Coconut water or fresh fruit" },
            { time: "6:00 PM", icon: "🍲", activity: "Dinner", description: "Moderate meal, avoid spicy foods" },
            { time: "8:00 PM", icon: "🌙", activity: "Evening Activities", description: "Cooling activities, avoid intense work" },
            { time: "9:00 PM", icon: "🛁", activity: "Cool Down", description: "Cool shower or moonlight walk" },
            { time: "10:00 PM", icon: "😴", activity: "Sleep", description: "Cool, dark room for quality rest" }
        ],
        kapha: [
            { time: "5:30 AM", icon: "🌅", activity: "Early Rise", description: "Wake up early to avoid sluggishness" },
            { time: "5:45 AM", icon: "🏃", activity: "Exercise", description: "Vigorous morning exercise" },
            { time: "6:30 AM", icon: "🚿", activity: "Invigorating Shower", description: "Warm shower with stimulating oils" },
            { time: "7:00 AM", icon: "☕", activity: "Stimulating Drink", description: "Ginger tea or green tea" },
            { time: "7:30 AM", icon: "🍽️", activity: "Light Breakfast", description: "Light, spiced foods" },
            { time: "12:00 PM", icon: "🥗", activity: "Main Meal", description: "Largest meal with warming spices" },
            { time: "2:00 PM", icon: "🌶️", activity: "Spiced Tea", description: "Stimulating herbal tea" },
            { time: "6:00 PM", icon: "🍲", activity: "Light Dinner", description: "Small, light, early dinner" },
            { time: "7:30 PM", icon: "🎵", activity: "Active Evening", description: "Stimulating activities, avoid TV" },
            { time: "9:00 PM", icon: "📖", activity: "Mental Stimulation", description: "Reading or learning something new" },
            { time: "10:00 PM", icon: "😴", activity: "Sleep", description: "Avoid oversleeping, 6-7 hours is enough" }
        ]
    };

    return routines[dosha] || routines.vata;
}

function getStressManagement(dosha) {
    const stressManagement = {
        vata: {
            description: "Vata types are prone to anxiety and worry. Focus on grounding, calming practices that soothe the nervous system.",
            techniques: [
                {
                    icon: "🧘",
                    name: "Grounding Meditation",
                    description: "A meditation practice focused on connecting with the earth and finding stability.",
                    steps: [
                        "Sit comfortably with feet on the ground",
                        "Close eyes and take 5 deep breaths",
                        "Visualize roots growing from your body into the earth",
                        "Feel the stability and support of the ground",
                        "Practice for 10-20 minutes daily"
                    ]
                },
                {
                    icon: "💆",
                    name: "Self-Massage (Abhyanga)",
                    description: "Daily oil massage to calm the nervous system and ground Vata energy.",
                    steps: [
                        "Warm sesame or almond oil",
                        "Start with the scalp and work downward",
                        "Use long strokes on limbs, circular on joints",
                        "Spend extra time on feet and hands",
                        "Leave oil on for 15 minutes before showering"
                    ]
                },
                {
                    icon: "🎵",
                    name: "Sound Therapy",
                    description: "Use calming sounds and music to soothe an overactive mind.",
                    steps: [
                        "Choose soft, rhythmic music or nature sounds",
                        "Sit or lie down comfortably",
                        "Focus on the sounds, letting thoughts pass",
                        "Practice deep, slow breathing",
                        "Continue for 15-30 minutes"
                    ]
                }
            ]
        },
        pitta: {
            description: "Pitta types experience stress as anger and irritability. Focus on cooling, calming practices that release heat.",
            techniques: [
                {
                    icon: "❄️",
                    name: "Cooling Pranayama",
                    description: "Breathing techniques that cool the body and calm fiery emotions.",
                    steps: [
                        "Sit comfortably with spine straight",
                        "Curl tongue and inhale through it (or purse lips)",
                        "Close mouth and exhale slowly through nose",
                        "Feel the cooling sensation",
                        "Repeat 10-20 times"
                    ]
                },
                {
                    icon: "🌙",
                    name: "Moon Gazing",
                    description: "Connect with cooling lunar energy to balance Pitta's solar nature.",
                    steps: [
                        "Find a comfortable spot outdoors at night",
                        "Gaze softly at the moon",
                        "Breathe deeply and slowly",
                        "Let the cool moonlight wash over you",
                        "Practice for 10-15 minutes"
                    ]
                },
                {
                    icon: "💚",
                    name: "Heart-Opening Meditation",
                    description: "Cultivate compassion and forgiveness to transform anger into love.",
                    steps: [
                        "Sit with hand on heart",
                        "Breathe into the heart space",
                        "Send loving thoughts to yourself",
                        "Extend love to others, even difficult people",
                        "End with gratitude practice"
                    ]
                }
            ]
        },
        kapha: {
            description: "Kapha types experience stress as depression and lethargy. Focus on energizing, uplifting practices.",
            techniques: [
                {
                    icon: "☀️",
                    name: "Sun Salutations",
                    description: "Dynamic yoga sequence to build heat and energy in the body.",
                    steps: [
                        "Start in mountain pose",
                        "Flow through the 12-pose sequence",
                        "Coordinate movement with breath",
                        "Build heat and energy",
                        "Practice 5-10 rounds"
                    ]
                },
                {
                    icon: "🔥",
                    name: "Breath of Fire",
                    description: "Energizing breathing practice to stimulate metabolism and mood.",
                    steps: [
                        "Sit with spine straight",
                        "Take a deep breath in",
                        "Exhale forcefully through nose while pulling navel in",
                        "Let inhalation happen naturally",
                        "Continue rapidly for 30 seconds to 3 minutes"
                    ]
                },
                {
                    icon: "🎶",
                    name: "Energizing Music & Movement",
                    description: "Use upbeat music and dance to lift mood and energy.",
                    steps: [
                        "Choose upbeat, inspiring music",
                        "Start with gentle swaying",
                        "Gradually increase movement",
                        "Let the body move freely",
                        "Continue for 10-20 minutes"
                    ]
                }
            ]
        }
    };

    return stressManagement[dosha] || stressManagement.vata;
}

function getSleepPlan(dosha) {
    const sleepPlans = {
        vata: {
            description: "Vata types often struggle with light, interrupted sleep. Focus on creating routine and calming the nervous system.",
            bedtime: "10:00 PM",
            wakeTime: "6:00 AM",
            duration: "8 hours",
            tips: [
                "Keep a consistent sleep schedule, even on weekends",
                "Create a calming bedtime routine with warm baths or reading",
                "Use heavy blankets and keep the room warm",
                "Avoid screens 1 hour before bed",
                "Try warm milk with nutmeg before sleep",
                "Use earplugs or white noise to block disturbing sounds",
                "Practice gentle yoga or meditation before bed"
            ]
        },
        pitta: {
            description: "Pitta types usually sleep well but may wake up feeling hot. Focus on cooling and avoiding late-night intensity.",
            bedtime: "10:30 PM",
            wakeTime: "6:00 AM",
            duration: "7-8 hours",
            tips: [
                "Keep bedroom cool and well-ventilated",
                "Use light, breathable bedding",
                "Avoid intense work or exercise in the evening",
                "Take a cool shower before bed",
                "Practice cooling pranayama or meditation",
                "Avoid spicy foods and caffeine after 2 PM",
                "Use blackout curtains to block morning light if needed"
            ]
        },
        kapha: {
            description: "Kapha types love sleep but may oversleep and feel groggy. Focus on getting quality sleep without excess.",
            bedtime: "10:00 PM",
            wakeTime: "5:30 AM",
            duration: "6-7 hours",
            tips: [
                "Wake up early, even if you don't feel like it",
                "Avoid daytime naps",
                "Keep bedroom slightly cool and dry",
                "Use an alarm clock across the room",
                "Exercise regularly to improve sleep quality",
                "Avoid heavy meals close to bedtime",
                "Get morning sunlight exposure immediately upon waking"
            ]
        }
    };

    return sleepPlans[dosha] || sleepPlans.vata;
}
// End of advanced lifestyle functions
//Emergency Navigation System - Simple and Direct
window.addEventListener('load', function () {
    console.log('Emergency navigation system loading...');

    // Wait a bit for DOM to be ready
    setTimeout(function () {
        const links = document.querySelectorAll('.nav-link');
        console.log('Emergency nav found links:', links.length);

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                console.log('Emergency nav clicked:', page);

                // Hide all pages
                const pages = document.querySelectorAll('.page');
                pages.forEach(function (p) {
                    p.classList.remove('active');
                });

                // Show target page
                const target = document.getElementById(page + '-page');
                if (target) {
                    target.classList.add('active');
                    console.log('Emergency nav showed:', page);
                }

                // Update active nav
                links.forEach(function (l) {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        console.log('Emergency navigation system ready!');
    }, 500);
});

// Also add direct onclick handlers to HTML elements
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        // Add onclick directly to each nav link
        const homeLink = document.querySelector('[data-page="home"]');
        if (homeLink) homeLink.onclick = () => showPageDirect('home');

        const assessmentLink = document.querySelector('[data-page="assessment"]');
        if (assessmentLink) assessmentLink.onclick = () => showPageDirect('assessment');

        const dietLink = document.querySelector('[data-page="diet-plan"]');
        if (dietLink) dietLink.onclick = () => showPageDirect('diet-plan');

        const lifestyleLink = document.querySelector('[data-page="lifestyle"]');
        if (lifestyleLink) lifestyleLink.onclick = () => showPageDirect('lifestyle');

        const aiLink = document.querySelector('[data-page="ai-assistant"]');
        if (aiLink) aiLink.onclick = () => showPageDirect('ai-assistant');

        const progressLink = document.querySelector('[data-page="progress"]');
        if (progressLink) progressLink.onclick = () => showPageDirect('progress');

        console.log('Direct onclick handlers added');
    }, 200);
});

function showPageDirect(pageId) {
    console.log('Direct page show:', pageId);

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById(pageId + '-page');
    if (target) {
        target.classList.add('active');
        console.log('Direct show success:', pageId);
    } else {
        console.error('Direct show failed - page not found:', pageId + '-page');
    }

    // Update nav
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    return false;
}