/**
 * Modern Interactions and Animations for Ayurveda AI
 * Enhanced UI/UX with smooth animations and interactive elements
 */

class ModernInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupInteractiveCards();
        this.setupNavigationEnhancements();
        this.setupLoadingAnimations();
        this.setupTooltips();
        this.setupProgressAnimations();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.group, .bg-white, section').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // Parallax effects for background elements
    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.animate-float');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Enhanced card interactions
    setupInteractiveCards() {
        const cards = document.querySelectorAll('.group');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e);
                this.addCardGlow(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeCardGlow(card);
            });

            card.addEventListener('click', (e) => {
                this.createClickEffect(e);
            });
        });
    }

    createRippleEffect(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full bg-white opacity-30 pointer-events-none';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.left = `${x - 10}px`;
        ripple.style.top = `${y - 10}px`;
        ripple.style.animation = 'ripple 0.6s ease-out';

        card.style.position = 'relative';
        card.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    addCardGlow(card) {
        card.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.15)';
        card.style.transform = 'translateY(-8px) scale(1.02)';
    }

    removeCardGlow(card) {
        card.style.boxShadow = '';
        card.style.transform = '';
    }

    createClickEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const explosion = document.createElement('div');
        explosion.className = 'absolute pointer-events-none';
        explosion.innerHTML = '✨';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.fontSize = '20px';
        explosion.style.animation = 'explode 0.8s ease-out forwards';

        button.style.position = 'relative';
        button.appendChild(explosion);

        setTimeout(() => explosion.remove(), 800);
    }

    // Enhanced navigation with smooth transitions
    setupNavigationEnhancements() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.smoothPageTransition(page);
                this.updateActiveNavLink(link);
            });
        });
    }

    smoothPageTransition(targetPage) {
        const currentPage = document.querySelector('.page.active');
        const targetPageElement = document.getElementById(`${targetPage}-page`);

        if (currentPage && targetPageElement) {
            // Fade out current page
            currentPage.style.opacity = '0';
            currentPage.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                currentPage.classList.remove('active');
                targetPageElement.classList.add('active');
                
                // Fade in new page
                targetPageElement.style.opacity = '0';
                targetPageElement.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    targetPageElement.style.opacity = '1';
                    targetPageElement.style.transform = 'translateX(0)';
                }, 50);
            }, 200);
        }
    }

    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.style.backgroundColor = '';
            link.style.color = '';
        });
        
        activeLink.classList.add('active');
        activeLink.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        activeLink.style.color = 'rgb(22, 163, 74)';
    }

    // Loading animations for dynamic content
    setupLoadingAnimations() {
        this.createLoadingSpinner();
    }

    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.id = 'modern-loading-spinner';
        spinner.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 hidden';
        spinner.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                <div class="text-lg font-medium text-gray-700">Processing your assessment...</div>
                <div class="text-sm text-gray-500 mt-2">Using AI to analyze your constitution</div>
            </div>
        `;
        document.body.appendChild(spinner);
    }

    showLoading(message = 'Loading...') {
        const spinner = document.getElementById('modern-loading-spinner');
        if (spinner) {
            spinner.querySelector('.text-lg').textContent = message;
            spinner.classList.remove('hidden');
        }
    }

    hideLoading() {
        const spinner = document.getElementById('modern-loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    // Interactive tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(e) {
        const text = e.target.dataset.tooltip;
        const tooltip = document.createElement('div');
        tooltip.id = 'modern-tooltip';
        tooltip.className = 'absolute bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
    }

    hideTooltip() {
        const tooltip = document.getElementById('modern-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Animated progress indicators
    setupProgressAnimations() {
        this.animateCounters();
    }

    animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    // Enhanced assessment interactions
    enhanceAssessmentForm() {
        const form = document.getElementById('assessment-form');
        if (!form) return;

        const questions = form.querySelectorAll('.question-container');
        
        questions.forEach((question, index) => {
            question.style.opacity = '0';
            question.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                question.style.transition = 'all 0.5s ease-out';
                question.style.opacity = '1';
                question.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Radio button interactions are now handled by assessment.js to avoid duplicates
        // This prevents multiple event handlers from being attached to the same elements
    }

    animateProgressBar() {
        // This method is now called from assessment.js updateProgress function
        // to avoid duplicate DOM queries and calculations
        const progressBar = document.getElementById('progress-fill');
        
        if (progressBar) {
            // Add smooth animation class if not already present
            if (!progressBar.classList.contains('smooth-progress')) {
                progressBar.classList.add('smooth-progress');
                progressBar.style.transition = 'width 0.3s ease-out';
            }
            
            // Check if completed for celebration
            const currentWidth = parseFloat(progressBar.style.width) || 0;
            if (currentWidth >= 100) {
                this.celebrateCompletion();
            }
        }
    }

    addSelectionFeedback(radio) {
        const questionContainer = radio.closest('.question-container');
        if (questionContainer) {
            questionContainer.style.transform = 'scale(1.02)';
            questionContainer.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.15)';
            
            setTimeout(() => {
                questionContainer.style.transform = 'scale(1)';
                questionContainer.style.boxShadow = '';
            }, 200);
        }
    }

    celebrateCompletion() {
        // Create confetti effect
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 100);
        }
    }

    createConfetti() {
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '✨', '🌟', '🎊'][Math.floor(Math.random() * 4)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.fontSize = '20px';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '1000';
        confetti.style.animation = 'fall 3s linear forwards';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }

    // Dosha-specific color themes
    applyDoshaTheme(dosha) {
        const themes = {
            vata: {
                primary: '#8B5CF6',
                secondary: '#A78BFA',
                accent: '#C4B5FD'
            },
            pitta: {
                primary: '#F59E0B',
                secondary: '#FBBF24',
                accent: '#FCD34D'
            },
            kapha: {
                primary: '#10B981',
                secondary: '#34D399',
                accent: '#6EE7B7'
            }
        };

        const theme = themes[dosha] || themes.kapha;
        document.documentElement.style.setProperty('--dosha-primary', theme.primary);
        document.documentElement.style.setProperty('--dosha-secondary', theme.secondary);
        document.documentElement.style.setProperty('--dosha-accent', theme.accent);
    }
}

// CSS animations to add to the document
const additionalCSS = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes explode {
        0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(3) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .page {
        transition: all 0.3s ease-in-out;
    }
    
    .nav-link {
        transition: all 0.2s ease-in-out;
    }
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize modern interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modernInteractions = new ModernInteractions();
    
    // Enhance assessment form when it's loaded
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const assessmentForm = document.getElementById('assessment-form');
                if (assessmentForm && assessmentForm.children.length > 0) {
                    window.modernInteractions.enhanceAssessmentForm();
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernInteractions;
}
