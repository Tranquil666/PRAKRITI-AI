/**
 * Dashboard Components for Ayurveda AI
 * Enhanced analytics and visualization components
 */

class DashboardComponents {
    constructor() {
        this.charts = {};
        this.metrics = {};
        this.init();
    }

    init() {
        this.setupMetricsCards();
        this.setupChartContainers();
        this.setupRealTimeUpdates();
    }

    // Create modern metrics cards
    createMetricsCard(title, value, icon, trend = null, color = 'primary') {
        const colorClasses = {
            primary: 'from-primary-500 to-primary-600',
            success: 'from-green-500 to-green-600',
            warning: 'from-yellow-500 to-yellow-600',
            danger: 'from-red-500 to-red-600',
            info: 'from-blue-500 to-blue-600',
            purple: 'from-purple-500 to-purple-600'
        };

        const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
        const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

        return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl">${icon}</div>
                    <div class="bg-gradient-to-r ${colorClasses[color]} text-white px-3 py-1 rounded-full text-sm font-medium">
                        Live
                    </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">${title}</h3>
                <div class="flex items-end justify-between">
                    <div class="text-3xl font-bold text-gray-800">${value}</div>
                    ${trend !== null ? `
                        <div class="flex items-center ${trendColor} text-sm font-medium">
                            <span class="mr-1">${trendIcon}</span>
                            <span>${Math.abs(trend)}%</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Create dosha distribution chart
    createDoshaChart(data) {
        const { vata, pitta, kapha } = data;
        const total = vata + pitta + kapha;
        
        const vataPercent = (vata / total) * 100;
        const pittaPercent = (pitta / total) * 100;
        const kaphaPercent = (kapha / total) * 100;

        return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span class="text-2xl mr-3">📊</span>
                    Dosha Distribution
                </h3>
                <div class="space-y-4">
                    <!-- Vata -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                            <span class="font-medium text-gray-700">Vata</span>
                        </div>
                        <span class="font-bold text-purple-600">${vataPercent.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out" style="width: ${vataPercent}%"></div>
                    </div>

                    <!-- Pitta -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                            <span class="font-medium text-gray-700">Pitta</span>
                        </div>
                        <span class="font-bold text-orange-600">${pittaPercent.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out" style="width: ${pittaPercent}%"></div>
                    </div>

                    <!-- Kapha -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                            <span class="font-medium text-gray-700">Kapha</span>
                        </div>
                        <span class="font-bold text-green-600">${kaphaPercent.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-1000 ease-out" style="width: ${kaphaPercent}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create performance metrics chart
    createPerformanceChart(metrics) {
        const { accuracy, responseTime, confidence, throughput } = metrics;

        return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span class="text-2xl mr-3">⚡</span>
                    Performance Metrics
                </h3>
                <div class="grid grid-cols-2 gap-4">
                    <!-- Accuracy -->
                    <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <div class="text-2xl font-bold text-blue-600">${(accuracy * 100).toFixed(1)}%</div>
                        <div class="text-sm text-blue-700 font-medium">Accuracy</div>
                        <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div class="bg-blue-500 h-full rounded-full transition-all duration-1000" style="width: ${accuracy * 100}%"></div>
                        </div>
                    </div>

                    <!-- Response Time -->
                    <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <div class="text-2xl font-bold text-green-600">${responseTime}ms</div>
                        <div class="text-sm text-green-700 font-medium">Response Time</div>
                        <div class="w-full bg-green-200 rounded-full h-2 mt-2">
                            <div class="bg-green-500 h-full rounded-full transition-all duration-1000" style="width: ${Math.max(10, 100 - (responseTime / 10))}%"></div>
                        </div>
                    </div>

                    <!-- Confidence -->
                    <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <div class="text-2xl font-bold text-purple-600">${(confidence * 100).toFixed(1)}%</div>
                        <div class="text-sm text-purple-700 font-medium">Confidence</div>
                        <div class="w-full bg-purple-200 rounded-full h-2 mt-2">
                            <div class="bg-purple-500 h-full rounded-full transition-all duration-1000" style="width: ${confidence * 100}%"></div>
                        </div>
                    </div>

                    <!-- Throughput -->
                    <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                        <div class="text-2xl font-bold text-orange-600">${throughput}</div>
                        <div class="text-sm text-orange-700 font-medium">Requests/min</div>
                        <div class="w-full bg-orange-200 rounded-full h-2 mt-2">
                            <div class="bg-orange-500 h-full rounded-full transition-all duration-1000" style="width: ${Math.min(100, (throughput / 100) * 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create test results display
    createTestResults(results) {
        const { success, failed, total, details } = results;
        const successRate = (success / total) * 100;

        return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span class="text-2xl mr-3">🧪</span>
                    Test Results
                </h3>
                
                <!-- Summary -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <div class="text-2xl font-bold text-green-600">${success}</div>
                        <div class="text-sm text-green-700">Passed</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                        <div class="text-2xl font-bold text-red-600">${failed}</div>
                        <div class="text-sm text-red-700">Failed</div>
                    </div>
                    <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <div class="text-2xl font-bold text-blue-600">${successRate.toFixed(1)}%</div>
                        <div class="text-sm text-blue-700">Success Rate</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Overall Progress</span>
                        <span>${total} tests</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div class="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-1000" style="width: ${successRate}%"></div>
                    </div>
                </div>

                <!-- Details -->
                <div class="space-y-2">
                    ${details.map(detail => `
                        <div class="flex items-center justify-between p-3 rounded-lg ${detail.status === 'passed' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
                            <div class="flex items-center">
                                <span class="mr-2">${detail.status === 'passed' ? '✅' : '❌'}</span>
                                <span class="font-medium">${detail.name}</span>
                            </div>
                            <span class="text-sm">${detail.duration}ms</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Create real-time activity feed
    createActivityFeed(activities) {
        return `
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <span class="text-2xl mr-3">📈</span>
                    Recent Activity
                </h3>
                <div class="space-y-4 max-h-80 overflow-y-auto">
                    ${activities.map(activity => `
                        <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <div class="text-lg">${activity.icon}</div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-800">${activity.title}</div>
                                <div class="text-xs text-gray-500">${activity.description}</div>
                                <div class="text-xs text-gray-400 mt-1">${activity.timestamp}</div>
                            </div>
                            <div class="text-xs px-2 py-1 rounded-full ${activity.type === 'success' ? 'bg-green-100 text-green-800' : activity.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                                ${activity.type}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Update dashboard with new data
    updateDashboard(data) {
        const dashboardContainer = document.getElementById('analytics-dashboard');
        if (!dashboardContainer) return;

        const dashboardHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                ${this.createMetricsCard('Total Assessments', data.totalAssessments || 0, '📊', 12, 'primary')}
                ${this.createMetricsCard('Accuracy Rate', `${((data.accuracy || 0.85) * 100).toFixed(1)}%`, '🎯', 5, 'success')}
                ${this.createMetricsCard('Avg Response Time', `${data.responseTime || 245}ms`, '⚡', -8, 'warning')}
                ${this.createMetricsCard('User Satisfaction', `${((data.satisfaction || 0.92) * 100).toFixed(1)}%`, '😊', 3, 'purple')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                ${this.createDoshaChart(data.doshaDistribution || { vata: 35, pitta: 40, kapha: 25 })}
                ${this.createPerformanceChart(data.performance || { accuracy: 0.87, responseTime: 245, confidence: 0.82, throughput: 45 })}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${this.createTestResults(data.testResults || { success: 8, failed: 2, total: 10, details: [
                    { name: 'Model Initialization', status: 'passed', duration: 156 },
                    { name: 'Prediction Accuracy', status: 'passed', duration: 234 },
                    { name: 'Cross Validation', status: 'failed', duration: 445 },
                    { name: 'Performance Benchmark', status: 'passed', duration: 123 }
                ]})}
                ${this.createActivityFeed(data.activities || [
                    { icon: '🚀', title: 'Model Initialized', description: 'Advanced ML model loaded successfully', timestamp: '2 minutes ago', type: 'success' },
                    { icon: '📊', title: 'Assessment Completed', description: 'User completed Prakriti assessment', timestamp: '5 minutes ago', type: 'info' },
                    { icon: '🎯', title: 'High Accuracy Achieved', description: 'Model achieved 94% accuracy on test set', timestamp: '8 minutes ago', type: 'success' },
                    { icon: '⚠️', title: 'Performance Warning', description: 'Response time exceeded 500ms threshold', timestamp: '12 minutes ago', type: 'error' }
                ])}
            </div>
        `;

        dashboardContainer.innerHTML = dashboardHTML;
        this.animateCounters();
    }

    // Animate counter values
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

    // Setup real-time updates
    setupRealTimeUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateMetricsWithRandomData();
        }, 5000);
    }

    updateMetricsWithRandomData() {
        const randomData = {
            totalAssessments: Math.floor(Math.random() * 1000) + 500,
            accuracy: 0.8 + (Math.random() * 0.15),
            responseTime: Math.floor(Math.random() * 200) + 150,
            satisfaction: 0.85 + (Math.random() * 0.1),
            doshaDistribution: {
                vata: Math.floor(Math.random() * 40) + 20,
                pitta: Math.floor(Math.random() * 40) + 20,
                kapha: Math.floor(Math.random() * 40) + 20
            },
            performance: {
                accuracy: 0.8 + (Math.random() * 0.15),
                responseTime: Math.floor(Math.random() * 200) + 150,
                confidence: 0.75 + (Math.random() * 0.2),
                throughput: Math.floor(Math.random() * 50) + 30
            }
        };

        // Only update if dashboard is visible
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard && dashboard.children.length > 0) {
            this.updateDashboard(randomData);
        }
    }

    setupMetricsCards() {
        // Initialize metrics tracking
        this.metrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            averageResponseTime: 0,
            lastUpdate: new Date()
        };
    }

    setupChartContainers() {
        // Initialize chart containers
        this.charts = {
            dosha: null,
            performance: null,
            timeline: null
        };
    }
}

// Initialize dashboard components
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardComponents = new DashboardComponents();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardComponents;
}
