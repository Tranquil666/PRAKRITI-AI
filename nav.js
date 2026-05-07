// Simple Navigation Script - Guaranteed to work
console.log('Navigation script loading...');

function showPageDirect(pageId) {
    console.log('Showing page:', pageId);

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    console.log('Found pages:', pages.length);
    pages.forEach(function (page) {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId + '-page');
    console.log('Target page element:', targetPage);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Successfully showed page:', pageId);

        // Load page-specific content
        if (pageId === 'lifestyle') {
            setTimeout(() => loadLifestyleRecommendations(), 100);
        } else if (pageId === 'ai-assistant') {
            setTimeout(() => initializeAIAssistant(), 100);
        } else if (pageId === 'diet-plan') {
            setTimeout(() => loadDietPlan(), 100);
        } else if (pageId === 'progress') {
            setTimeout(() => loadProgressData(), 100);
        }

    } else {
        console.error('Could not find page:', pageId + '-page');
        // List all available pages
        const allPages = document.querySelectorAll('[id$="-page"]');
        console.log('Available pages:', Array.from(allPages).map(p => p.id));
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    return false;
}

// Test function
function testNavigation() {
    console.log('Testing navigation...');
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.nav-link');
    console.log('Pages found:', pages.length);
    console.log('Links found:', links.length);

    pages.forEach(function (page, index) {
        console.log(`Page ${index}:`, page.id, page.classList.contains('active') ? '(active)' : '');
    });

    links.forEach(function (link, index) {
        console.log(`Link ${index}:`, link.getAttribute('data-page'), link.classList.contains('active') ? '(active)' : '');
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing navigation...');
    testNavigation();

    // Add click handlers
    const links = document.querySelectorAll('.nav-link');
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            console.log('Link clicked:', page);
            showPageDirect(page);
        });
    });

    console.log('Navigation initialized successfully');
});

console.log('Navigation script loaded');

// Toggle sidebar functionality
function toggleSidebar() {
    console.log('Toggle sidebar called');
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

// Navigation function for discover cards
function navigateToPage(page) {
    console.log('Navigate to page called:', page);
    showPageDirect(page);
}

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.navigateToPage = navigateToPage;
window.showPageDirect = showPageDirect;