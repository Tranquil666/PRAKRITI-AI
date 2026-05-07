// Lifestyle Recommendations Script
console.log('Lifestyle script loading...');

// Lifestyle Recommendations Data (make globally accessible)
window.lifestyleRecommendations = {
    'vata': {
        exercise: 'Gentle yoga, walking, swimming, tai chi',
        sleep: '7-8 hours, regular sleep schedule, warm environment',
        stress_management: 'Meditation, oil massage, calming music, routine',
        daily_routine: 'Regular meal times, consistent schedule, avoid rushing'
    },
    'pitta': {
        exercise: 'Moderate exercise, swimming, cycling, avoid overheating',
        sleep: '7-8 hours, cool environment, avoid late nights',
        stress_management: 'Cooling activities, avoid competition, moderate pace',
        daily_routine: 'Balanced schedule, avoid skipping meals, take breaks'
    },
    'kapha': {
        exercise: 'Vigorous exercise, running, aerobics, strength training',
        sleep: '6-7 hours, avoid daytime naps, wake early',
        stress_management: 'Energizing activities, social interaction, variety in routine',
        daily_routine: 'Active lifestyle, light meals, avoid sedentary behavior'
    }
};

function loadLifestyleRecommendations() {
    console.log('Loading lifestyle recommendations...');
    const lifestyleContent = document.getElementById('lifestyle-content');

    if (!lifestyleContent) {
        console.error('Lifestyle content element not found');
        return;
    }

    // Check if user has completed assessment
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    let currentUser = null;
    
    if (userData) {
        try {
            const data = JSON.parse(userData);
            currentUser = data.currentUser;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    if (!currentUser) {
        lifestyleContent.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized lifestyle recommendations.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }

    const dosha = currentUser.primary_dosha;
    const recommendations = window.lifestyleRecommendations[dosha];

    if (!recommendations) {
        lifestyleContent.innerHTML = '<p>Unable to load recommendations. Please try again.</p>';
        return;
    }

    let lifestyleHTML = `
        <div class="lifestyle-planner-header">
            <h3>🏃 Complete Lifestyle Planning System for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h3>
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
    
    console.log('Lifestyle recommendations loaded successfully');
}

// Advanced Exercise Planning System
function generateExercisePlan() {
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    let currentUser = null;
    
    if (userData) {
        try {
            const data = JSON.parse(userData);
            currentUser = data.currentUser;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    if (!currentUser) {
        const displayArea = document.getElementById('lifestyle-plan-display');
        displayArea.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized exercise plans.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }

    const dosha = currentUser.primary_dosha;
    const exercisePlan = getAdvancedExercisePlan(dosha);
    
    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="exercise-plan-container">
            <h4>💪 Advanced Exercise Plan for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
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
                            <div class="exercise-benefits">Benefits: ${day.benefits}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="exercise-tips">
                <h5>💡 Advanced Exercise Tips</h5>
                <ul>
                    ${exercisePlan.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>

            <div class="seasonal-adjustments">
                <h5>🌿 Seasonal Exercise Adjustments</h5>
                ${Object.entries(exercisePlan.seasonalAdjustments).map(([season, adjustment]) => `
                    <div class="seasonal-item">
                        <strong>${season}:</strong> ${adjustment}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateDailyRoutine() {
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    let currentUser = null;
    
    if (userData) {
        try {
            const data = JSON.parse(userData);
            currentUser = data.currentUser;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    if (!currentUser) {
        const displayArea = document.getElementById('lifestyle-plan-display');
        displayArea.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized daily routines.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }

    const dosha = currentUser.primary_dosha;
    const routine = getAdvancedDailyRoutine(dosha);
    
    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="routine-container">
            <h4>🌅 Advanced Daily Routine for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${routine.description}</p>
            
            <div class="routine-timeline">
                ${routine.schedule.map(activity => `
                    <div class="routine-item">
                        <div class="routine-time">${activity.time}</div>
                        <div class="routine-activity">
                            <span class="activity-icon">${activity.icon}</span>
                            <div class="activity-details">
                                <h6>${activity.activity}</h6>
                                <p>${activity.description}</p>
                                <div class="activity-benefits">Benefits: ${activity.benefits}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="routine-principles">
                <h5>🎯 Key Principles for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h5>
                <ul>
                    ${routine.principles.map(principle => `<li>${principle}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateStressManagement() {
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    let currentUser = null;
    
    if (userData) {
        try {
            const data = JSON.parse(userData);
            currentUser = data.currentUser;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    if (!currentUser) {
        const displayArea = document.getElementById('lifestyle-plan-display');
        displayArea.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized stress management plans.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }

    const dosha = currentUser.primary_dosha;
    const stressManagement = getAdvancedStressManagement(dosha);
    
    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="stress-management-container">
            <h4>🧘 Advanced Stress Management for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${stressManagement.description}</p>
            
            <div class="stress-techniques">
                ${stressManagement.techniques.map(technique => `
                    <div class="technique-card">
                        <div class="technique-header">
                            <span class="technique-icon">${technique.icon}</span>
                            <h5>${technique.name}</h5>
                            <span class="technique-duration">${technique.duration}</span>
                        </div>
                        <div class="technique-content">
                            <p>${technique.description}</p>
                            <div class="technique-steps">
                                <strong>Step-by-step practice:</strong>
                                <ol>
                                    ${technique.steps.map(step => `<li>${step}</li>`).join('')}
                                </ol>
                            </div>
                            <div class="technique-benefits">
                                <strong>Benefits:</strong> ${technique.benefits}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="emergency-techniques">
                <h5>🚨 Quick Stress Relief Techniques</h5>
                ${stressManagement.emergencyTechniques.map(technique => `
                    <div class="emergency-technique">
                        <strong>${technique.name}:</strong> ${technique.description}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateSleepPlan() {
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    let currentUser = null;
    
    if (userData) {
        try {
            const data = JSON.parse(userData);
            currentUser = data.currentUser;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    if (!currentUser) {
        const displayArea = document.getElementById('lifestyle-plan-display');
        displayArea.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized sleep optimization plans.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }

    const dosha = currentUser.primary_dosha;
    const sleepPlan = getAdvancedSleepPlan(dosha);
    
    const displayArea = document.getElementById('lifestyle-plan-display');
    displayArea.innerHTML = `
        <div class="sleep-plan-container">
            <h4>😴 Advanced Sleep Optimization for ${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</h4>
            <p class="plan-description">${sleepPlan.description}</p>
            
            <div class="sleep-schedule">
                <h5>🕘 Optimal Sleep Schedule</h5>
                <div class="sleep-times">
                    <div class="sleep-time">
                        <span class="time-icon">🌙</span>
                        <div>
                            <strong>Bedtime:</strong> ${sleepPlan.bedtime}
                            <small>Best for ${dosha} constitution</small>
                        </div>
                    </div>
                    <div class="sleep-time">
                        <span class="time-icon">🌅</span>
                        <div>
                            <strong>Wake time:</strong> ${sleepPlan.wakeTime}
                            <small>Aligned with natural rhythms</small>
                        </div>
                    </div>
                    <div class="sleep-time">
                        <span class="time-icon">⏰</span>
                        <div>
                            <strong>Duration:</strong> ${sleepPlan.duration}
                            <small>Optimal for your dosha</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bedtime-routine">
                <h5>🌙 Personalized Bedtime Routine</h5>
                <div class="routine-steps">
                    ${sleepPlan.bedtimeRoutine.map((step, index) => `
                        <div class="routine-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-content">
                                <strong>${step.time}:</strong> ${step.activity}
                                <p>${step.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="sleep-environment">
                <h5>🏠 Optimal Sleep Environment</h5>
                <div class="environment-grid">
                    ${Object.entries(sleepPlan.environment).map(([aspect, details]) => `
                        <div class="environment-item">
                            <strong>${aspect.charAt(0).toUpperCase() + aspect.slice(1)}:</strong>
                            <p>${details}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="sleep-troubleshooting">
                <h5>🔧 Sleep Troubleshooting</h5>
                ${sleepPlan.troubleshooting.map(issue => `
                    <div class="troubleshooting-item">
                        <strong>If you experience ${issue.problem}:</strong>
                        <p>${issue.solution}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Initialize when page is shown
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lifestyle script DOM loaded');
});

console.log('Lifestyle script loaded');// 
//Advanced Exercise Plan Data
function getAdvancedExercisePlan(dosha) {
    const exercisePlans = {
        vata: {
            description: "Vata types benefit from gentle, grounding exercises that build stability and strength without overstimulation. Focus on consistency and routine.",
            weeklySchedule: [
                { 
                    type: "Gentle Hatha Yoga", 
                    duration: "45-60 minutes", 
                    intensity: "Low-Medium",
                    benefits: "Grounding, flexibility, nervous system balance"
                },
                { 
                    type: "Nature Walking", 
                    duration: "30-45 minutes", 
                    intensity: "Low",
                    benefits: "Cardiovascular health, mental clarity, grounding"
                },
                { 
                    type: "Light Strength Training", 
                    duration: "30-40 minutes", 
                    intensity: "Medium",
                    benefits: "Bone density, muscle tone, stability"
                },
                { 
                    type: "Tai Chi or Qigong", 
                    duration: "45 minutes", 
                    intensity: "Low",
                    benefits: "Balance, coordination, energy flow"
                },
                { 
                    type: "Swimming (warm water)", 
                    duration: "30-40 minutes", 
                    intensity: "Medium",
                    benefits: "Full body workout, joint health, relaxation"
                },
                { 
                    type: "Restorative Yoga", 
                    duration: "60-75 minutes", 
                    intensity: "Very Low",
                    benefits: "Deep relaxation, stress relief, nervous system reset"
                },
                { 
                    type: "Gentle Stretching/Rest", 
                    duration: "20-30 minutes", 
                    intensity: "Very Low",
                    benefits: "Recovery, flexibility, mindfulness"
                }
            ],
            tips: [
                "Exercise at the same time daily to establish routine",
                "Avoid overexertion - listen to your body's signals",
                "Focus on grounding poses and slow, controlled movements",
                "Exercise indoors during windy or cold weather",
                "Include 10-15 minute warm-up and cool-down periods",
                "Practice deep breathing throughout your workout",
                "Stay hydrated with warm water before and after exercise"
            ],
            seasonalAdjustments: {
                "Spring": "Increase activity gradually, focus on detoxifying movements",
                "Summer": "Exercise during cooler hours, stay well-hydrated",
                "Fall": "Maintain consistent routine, add grounding exercises",
                "Winter": "Focus on indoor activities, increase warm-up time"
            }
        }, 
       pitta: {
            description: "Pitta types thrive with moderate, cooling exercises that channel their natural intensity without overheating. Avoid competitive activities during hot weather.",
            weeklySchedule: [
                { 
                    type: "Swimming", 
                    duration: "45-60 minutes", 
                    intensity: "Medium-High",
                    benefits: "Full body workout, cooling, cardiovascular health"
                },
                { 
                    type: "Cycling (early morning)", 
                    duration: "40-50 minutes", 
                    intensity: "Medium",
                    benefits: "Leg strength, endurance, fresh air"
                },
                { 
                    type: "Cooling Yoga Flow", 
                    duration: "45-60 minutes", 
                    intensity: "Medium",
                    benefits: "Flexibility, balance, cooling pranayama"
                },
                { 
                    type: "Tennis/Racquet Sports", 
                    duration: "45-60 minutes", 
                    intensity: "High",
                    benefits: "Agility, hand-eye coordination, competitive outlet"
                },
                { 
                    type: "Hiking (shaded trails)", 
                    duration: "60-90 minutes", 
                    intensity: "Medium",
                    benefits: "Nature connection, leg strength, mental clarity"
                },
                { 
                    type: "Pilates", 
                    duration: "45-60 minutes", 
                    intensity: "Medium",
                    benefits: "Core strength, precision, mind-body connection"
                },
                { 
                    type: "Gentle Yoga/Meditation", 
                    duration: "30-45 minutes", 
                    intensity: "Low",
                    benefits: "Recovery, stress relief, cooling"
                }
            ],
            tips: [
                "Exercise during cooler parts of the day (early morning/evening)",
                "Stay well-hydrated with cool water throughout",
                "Choose non-competitive activities when feeling stressed",
                "Exercise outdoors in shade or cool, well-ventilated spaces",
                "Include cooling pranayama (Sheetali, Sheetkari) after workouts",
                "Avoid exercising in direct sunlight or hot conditions",
                "Take breaks when feeling overheated or irritated"
            ],
            seasonalAdjustments: {
                "Spring": "Gradually increase intensity, enjoy moderate temperatures",
                "Summer": "Focus on water activities, exercise very early or late",
                "Fall": "Perfect season for outdoor activities, maintain consistency",
                "Winter": "Can handle more intense workouts, still avoid overheating"
            }
        }, 
       kapha: {
            description: "Kapha types need vigorous, stimulating exercises to boost metabolism and energy levels. Embrace challenging workouts and variety to prevent stagnation.",
            weeklySchedule: [
                { 
                    type: "HIIT Training", 
                    duration: "30-45 minutes", 
                    intensity: "High",
                    benefits: "Metabolism boost, fat burning, cardiovascular fitness"
                },
                { 
                    type: "Running/Jogging", 
                    duration: "45-60 minutes", 
                    intensity: "High",
                    benefits: "Endurance, weight management, mental clarity"
                },
                { 
                    type: "Power/Hot Yoga", 
                    duration: "60-75 minutes", 
                    intensity: "High",
                    benefits: "Strength, flexibility, detoxification through sweat"
                },
                { 
                    type: "Weight Training", 
                    duration: "45-60 minutes", 
                    intensity: "High",
                    benefits: "Muscle building, bone density, metabolism boost"
                },
                { 
                    type: "Dance/Aerobics", 
                    duration: "45-60 minutes", 
                    intensity: "High",
                    benefits: "Cardiovascular health, coordination, joy and energy"
                },
                { 
                    type: "Rock Climbing/Boxing", 
                    duration: "60-75 minutes", 
                    intensity: "High",
                    benefits: "Full body strength, mental focus, challenge"
                },
                { 
                    type: "Active Recovery (hiking)", 
                    duration: "60-90 minutes", 
                    intensity: "Medium",
                    benefits: "Active rest, nature connection, sustained movement"
                }
            ],
            tips: [
                "Exercise early morning (6-8 AM) to boost daily energy",
                "Choose challenging, varied workouts to prevent boredom",
                "Exercise even when you don't feel motivated - consistency is key",
                "Include competitive or group activities for motivation",
                "Focus on building heat and working up a good sweat",
                "Try new activities regularly to maintain interest",
                "Push yourself beyond your comfort zone safely"
            ],
            seasonalAdjustments: {
                "Spring": "Perfect time for detox workouts, increase intensity",
                "Summer": "Maintain high intensity, ensure proper hydration",
                "Fall": "Great season for outdoor activities, build strength",
                "Winter": "Combat seasonal sluggishness with vigorous indoor workouts"
            }
        }
    };
    
    return exercisePlans[dosha] || exercisePlans.vata;
} 

// Advanced Daily Routine Data
function getAdvancedDailyRoutine(dosha) {
    const routines = {
        vata: {
            description: "Vata types thrive on routine and consistency. This schedule provides grounding and stability to balance Vata's naturally variable nature.",
            schedule: [
                {
                    time: "6:00 AM", 
                    icon: "🌅", 
                    activity: "Gentle Awakening", 
                    description: "Rise slowly, avoid rushing. Set intention for the day.",
                    benefits: "Nervous system balance, mindful start"
                },
                { 
                    time: "6:15 AM", 
                    icon: "🧘", 
                    activity: "Grounding Meditation", 
                    description: "10-15 minutes of seated meditation focusing on breath and body awareness.",
                    benefits: "Mental clarity, anxiety reduction, grounding"
                },
                { 
                    time: "6:30 AM", 
                    icon: "💆", 
                    activity: "Self-Massage (Abhyanga)", 
                    description: "Warm oil massage from head to toe, especially feet and scalp.",
                    benefits: "Circulation, skin health, nervous system nourishment"
                },
                { 
                    time: "7:00 AM", 
                    icon: "🚿", 
                    activity: "Warm Shower", 
                    description: "Warm (not hot) water to maintain body temperature balance.",
                    benefits: "Cleansing, circulation, preparation for day"
                },
                { 
                    time: "7:30 AM", 
                    icon: "🍵", 
                    activity: "Warm Morning Drink", 
                    description: "Ginger tea, warm water with lemon, or herbal tea.",
                    benefits: "Digestive fire stimulation, hydration, warmth"
                },
                { 
                    time: "8:00 AM", 
                    icon: "🍽️", 
                    activity: "Nourishing Breakfast", 
                    description: "Warm, cooked foods like oatmeal with nuts and dates.",
                    benefits: "Sustained energy, grounding, digestive health"
                },
                { 
                    time: "12:30 PM", 
                    icon: "🥗", 
                    activity: "Main Meal (Lunch)", 
                    description: "Largest meal of the day, eaten mindfully in calm environment.",
                    benefits: "Optimal digestion, energy for afternoon, satisfaction"
                },
                { 
                    time: "3:00 PM", 
                    icon: "☕", 
                    activity: "Afternoon Nourishment", 
                    description: "Warm herbal tea with light, sweet snack if needed.",
                    benefits: "Energy maintenance, blood sugar stability"
                },
                { 
                    time: "6:30 PM", 
                    icon: "🍲", 
                    activity: "Light Dinner", 
                    description: "Warm, easy-to-digest meal, smaller than lunch.",
                    benefits: "Evening nourishment without heaviness"
                },
                { 
                    time: "8:00 PM", 
                    icon: "📚", 
                    activity: "Calming Activities", 
                    description: "Reading, gentle music, light conversation, avoid screens.",
                    benefits: "Mental relaxation, preparation for sleep"
                },
                { 
                    time: "9:30 PM", 
                    icon: "🛁", 
                    activity: "Evening Wind-Down", 
                    description: "Warm bath, foot massage, or gentle stretching.",
                    benefits: "Nervous system calming, sleep preparation"
                },
                { 
                    time: "10:00 PM", 
                    icon: "😴", 
                    activity: "Sleep", 
                    description: "Consistent bedtime in warm, comfortable environment.",
                    benefits: "Nervous system restoration, cellular repair"
                }
            ],
            principles: [
                "Maintain consistent timing for all activities",
                "Prioritize warmth in food, environment, and activities",
                "Create calm, peaceful environments",
                "Avoid rushing or overstimulation",
                "Include grounding practices throughout the day",
                "Eat meals at regular times without skipping",
                "End the day with calming, nurturing activities"
            ]
        }
    };
    
    return routines[dosha] || routines.vata;
}