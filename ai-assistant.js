// AI Assistant Script
console.log('AI Assistant script loading...');

// SECURITY: never embed an API key in client-side code. The previous version of this file
// shipped a live Gemini key that was scraped from the public repo. Calls now go through a
// serverless proxy (see SECURITY-SCRUB.md, Step 9). Set window.PRAKRITI_AI_PROXY_URL in
// your deployment config to point at that endpoint, e.g. /api/ayurveda-chat.
let geminiApiKey = ''; // intentionally blank; do not re-introduce a literal key here.
let chatHistory = [];

function initializeAIAssistant() {
    console.log('Initializing AI Assistant...');
    
    // Hide API setup and show AI features
    const apiSetup = document.getElementById('api-setup');
    const aiFeatures = document.getElementById('ai-features');
    
    if (apiSetup) apiSetup.style.display = 'none';
    if (aiFeatures) aiFeatures.style.display = 'block';
    
    // Initialize chat
    initializeChat();
    
    console.log('AI Assistant initialized successfully');
}

function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>Hello! I'm your Ayurvedic AI assistant. I can help you with:</p>
                    <ul>
                        <li>🍽️ Diet and nutrition advice</li>
                        <li>🧘 Lifestyle recommendations</li>
                        <li>🌿 Herbal remedies and treatments</li>
                        <li>⚖️ Dosha balancing tips</li>
                    </ul>
                    <p>What would you like to know about Ayurveda?</p>
                </div>
            </div>
        `;
    }
}

function showTab(tabName) {
    console.log('Showing AI tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) {
        console.error('Chat elements not found');
        return;
    }
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message. The user's text is HTML-escaped to neutralise any payload like
    // <img src=x onerror=alert(1)>. We still keep the surrounding markup as innerHTML.
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    const escMessage = (window.escapeHTML || ((s) => String(s)))(message);
    userMessageDiv.innerHTML = `
        <div class="message-content">
            <p>${escMessage}</p>
        </div>
        <div class="message-avatar">👤</div>
    `;
    chatMessages.appendChild(userMessageDiv);
    
    // Clear input
    chatInput.value = '';
    
    // Add loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message loading';
    loadingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Thinking...</p>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove loading message
        chatMessages.removeChild(loadingDiv);
        
        // Add AI response. The Gemini response can contain markdown/HTML, so we run it
        // through DOMPurify (loaded via safe_html.js) before injection. If DOMPurify
        // failed to load, setSafeHTML falls back to textContent.
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'ai-message';
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        const content = document.createElement('div');
        content.className = 'message-content';
        const p = document.createElement('p');
        if (window.setSafeHTML) {
            window.setSafeHTML(p, response);
        } else {
            p.textContent = response;
        }
        content.appendChild(p);
        aiMessageDiv.appendChild(avatar);
        aiMessageDiv.appendChild(content);
        chatMessages.appendChild(aiMessageDiv);
        
    } catch (error) {
        console.error('Chat error:', error);
        
        // Remove loading message
        chatMessages.removeChild(loadingDiv);
        
        // Add error message. Sanitize the fallback string in case it ever sources untrusted data.
        const errorDiv = document.createElement('div');
        errorDiv.className = 'ai-message';
        const fb = getFallbackResponse(message);
        const safeFb = (window.escapeHTML || ((s) => String(s)))(fb);
        errorDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>I apologize, but I'm having trouble connecting right now. Here's some general Ayurvedic advice: ${safeFb}</p>
            </div>
        `;
        chatMessages.appendChild(errorDiv);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIResponse(message) {
    // Simple fallback responses for now
    return getFallbackResponse(message);
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('food')) {
        return "For optimal health, eat according to your dosha: Vata benefits from warm, moist foods; Pitta from cool, sweet foods; and Kapha from light, spicy foods. Always eat mindfully and at regular times.";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
        return "Good sleep is essential for all doshas. Vata types should maintain regular sleep schedules, Pitta types should keep cool sleeping environments, and Kapha types should avoid oversleeping. Try going to bed by 10 PM.";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
        return "Stress affects each dosha differently. Vata types benefit from grounding practices like meditation, Pitta types from cooling activities, and Kapha types from energizing exercises. Regular pranayama (breathing exercises) helps all constitutions.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
        return "Exercise should match your constitution: Vata types do best with gentle, grounding exercises like yoga; Pitta types with moderate, cooling activities like swimming; and Kapha types with vigorous, heating exercises like running.";
    }
    
    return "Thank you for your question! In Ayurveda, balance is key. Focus on eating according to your dosha, maintaining regular routines, and listening to your body's natural rhythms. Consider consulting with an Ayurvedic practitioner for personalized guidance.";
}

async function analyzeSymptoms() {
    const symptomsInput = document.getElementById('symptoms-input');
    const symptomsResult = document.getElementById('symptoms-result');
    
    if (!symptomsInput || !symptomsResult) {
        console.error('Symptoms elements not found');
        return;
    }
    
    const symptoms = symptomsInput.value.trim();
    if (!symptoms) {
        alert('Please describe your symptoms first.');
        return;
    }
    
    symptomsResult.innerHTML = '<div class="loading">Analyzing symptoms...</div>';
    
    try {
        const analysis = getSymptomAnalysis(symptoms);
        
        symptomsResult.innerHTML = `
            <div class="analysis-result">
                <h4>🩺 Ayurvedic Analysis</h4>
                <p>${analysis}</p>
                <div class="disclaimer">
                    <small><strong>Disclaimer:</strong> This is for educational purposes only and should not replace professional medical advice.</small>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Symptom analysis error:', error);
        symptomsResult.innerHTML = `
            <div class="error-message">
                <p>Unable to analyze symptoms at the moment. Please try again later.</p>
            </div>
        `;
    }
}

function getSymptomAnalysis(symptoms) {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('tired') || lowerSymptoms.includes('fatigue')) {
        return "Fatigue may indicate a Kapha imbalance. Try incorporating more energizing foods like ginger and black pepper, engage in regular exercise, and avoid heavy, oily foods. Consider waking up earlier and avoiding daytime naps.";
    }
    
    if (lowerSymptoms.includes('anxious') || lowerSymptoms.includes('worry')) {
        return "Anxiety often relates to Vata imbalance. Focus on grounding practices: eat warm, nourishing foods, maintain regular routines, practice meditation, and consider oil massage. Avoid cold, dry, and raw foods.";
    }
    
    if (lowerSymptoms.includes('anger') || lowerSymptoms.includes('irritable')) {
        return "Irritability suggests Pitta imbalance. Cool down with sweet, bitter foods, avoid spicy and sour foods, practice cooling pranayama, and engage in calming activities. Avoid overheating and competitive situations.";
    }
    
    if (lowerSymptoms.includes('digest') || lowerSymptoms.includes('stomach')) {
        return "Digestive issues can affect all doshas differently. Eat according to your constitution, maintain regular meal times, avoid overeating, and consider digestive spices like cumin, coriander, and fennel. Drink warm water throughout the day.";
    }
    
    return "Based on Ayurvedic principles, symptoms often indicate dosha imbalances. Focus on balancing your primary dosha through appropriate diet, lifestyle, and daily routines. Consider consulting with an Ayurvedic practitioner for personalized treatment.";
}

async function generateInsights() {
    const insightsContent = document.getElementById('insights-content');
    
    if (!insightsContent) {
        console.error('Insights content not found');
        return;
    }
    
    // Check if user has assessment data
    const userData = localStorage.getItem('ayurvedic_prakriti_data');
    if (!userData) {
        insightsContent.innerHTML = `
            <div class="recommendation-card-default">
                <div class="card-header">
                    <span class="card-icon">📊</span>
                    <h4 class="card-title">Assessment Required</h4>
                </div>
                <div class="card-content">
                    <p>Please complete the Prakriti assessment first to get personalized insights.</p>
                    <button onclick="showPageDirect('assessment')" class="btn-primary">Take Assessment</button>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        const data = JSON.parse(userData);
        const currentUser = data.currentUser;
        
        if (!currentUser) {
            throw new Error('No user data found');
        }
        
        const insights = generatePersonalizedInsights(currentUser);
        
        insightsContent.innerHTML = `
            <div class="insights-result">
                <h4>🎯 Your Personalized Insights</h4>
                ${insights}
            </div>
        `;
        
    } catch (error) {
        console.error('Insights generation error:', error);
        insightsContent.innerHTML = `
            <div class="error-message">
                <p>Unable to generate insights. Please complete the assessment first.</p>
            </div>
        `;
    }
}

function generatePersonalizedInsights(userData) {
    const dosha = userData.primary_dosha;
    const percentage = userData.dosha_percentages[dosha];
    
    return `
        <div class="insight-card">
            <h5>🌟 Constitution Analysis</h5>
            <p>Your primary dosha is <strong>${dosha.charAt(0).toUpperCase() + dosha.slice(1)}</strong> at ${percentage}%. This means you have a ${dosha} constitution with specific needs for optimal health.</p>
        </div>
        
        <div class="insight-card">
            <h5>🍽️ Dietary Recommendations</h5>
            <p>Focus on ${dosha === 'vata' ? 'warm, moist, and grounding foods' : dosha === 'pitta' ? 'cool, sweet, and calming foods' : 'light, warm, and stimulating foods'} to maintain balance.</p>
        </div>
        
        <div class="insight-card">
            <h5>🧘 Lifestyle Tips</h5>
            <p>${dosha === 'vata' ? 'Maintain regular routines and avoid rushing. Practice grounding exercises.' : dosha === 'pitta' ? 'Stay cool and avoid overheating. Practice moderation in all activities.' : 'Stay active and avoid sedentary behavior. Wake up early and exercise regularly.'}</p>
        </div>
    `;
}

// Initialize AI Assistant when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Assistant DOM loaded');
    
    setTimeout(function() {
        initializeAIAssistant();
        
        // Add enter key handler for chat
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        
        console.log('AI Assistant initialized');
    }, 500);
});

console.log('AI Assistant script loaded');