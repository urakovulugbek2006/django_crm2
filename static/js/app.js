/**
 * Modern CRM - Application JavaScript
 * Enhanced interactivity and user experience
 */

// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateIcon();
        window.themeManager = this;
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateIcon();
        this.updateCharts();
    }

    updateIcon() {
        const sunIcon = document.getElementById('sun-icon');
        if (sunIcon) {
            if (this.theme === 'dark') {
                sunIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
            } else {
                sunIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
            }
        }
    }

    updateCharts() {
        // Update ApexCharts theme if they exist
        if (typeof ApexCharts !== 'undefined' && window.chartsInstances) {
            window.chartsInstances.forEach(chart => {
                chart.updateOptions({
                    theme: {
                        mode: this.theme
                    }
                });
            });
        }
    }
}

// Dropdown Component
class Dropdown {
    constructor(trigger, menu) {
        this.trigger = document.getElementById(trigger);
        this.menu = document.getElementById(menu);
        this.isOpen = false;
        
        if (this.trigger && this.menu) {
            this.init();
        }
    }

    init() {
        document.addEventListener('click', (e) => {
            if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.menu.classList.remove('hidden');
        this.menu.classList.add('animate-fade-in');
        this.isOpen = true;
    }

    close() {
        this.menu.classList.add('hidden');
        this.menu.classList.remove('animate-fade-in');
        this.isOpen = false;
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = [];
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.create(message, type);
        this.container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('animate-slide-in-right');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    create(message, type) {
        const notification = document.createElement('div');
        const icons = {
            success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
            error: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
            warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>`,
            info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`
        };

        const colors = {
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        };

        notification.className = `flex items-center gap-3 p-4 rounded-lg border ${colors[type]} shadow-lg transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icons[type]}
            </svg>
            <p class="flex-1 text-sm font-medium">${message}</p>
            <button onclick="this.parentElement.remove()" class="p-1 hover:bg-black hover:bg-opacity-10 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        return notification;
    }

    remove(notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

// Close mobile menu when overlay is clicked
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMobileMenu);
    }
});

// Enhanced Form Handling
class FormManager {
    constructor() {
        this.init();
    }

    init() {
        // Add loading states to forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Add field validation
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', this.validateField.bind(this));
        });
    }

    handleFormSubmit(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            `;
        }
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }

        this.showFieldValidation(field, isValid, message);
    }

    showFieldValidation(field, isValid, message) {
        // Remove existing validation
        const existingError = field.parentElement.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('border-red-500', 'border-green-500');

        if (!isValid) {
            field.classList.add('border-red-500');
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error text-red-600 text-sm mt-1';
            errorElement.textContent = message;
            field.parentElement.appendChild(errorElement);
        } else if (field.value.trim()) {
            field.classList.add('border-green-500');
        }
    }
}

// Search Functionality
class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('input[placeholder="Search..."]');
        if (this.searchInput) {
            this.init();
        }
    }

    init() {
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
    }

    handleSearch(e) {
        const query = e.target.value.trim();
        if (query.length > 2) {
            this.debounce(() => this.performSearch(query), 300);
        }
    }

    performSearch(query = '') {
        // Implement search logic here
        console.log('Searching for:', query);
        // You can integrate this with Django's search functionality
    }

    debounce(func, wait) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(func, wait);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme manager
    new ThemeManager();
    
    // Initialize notification manager
    window.notifications = new NotificationManager();
    
    // Initialize form manager
    new FormManager();
    
    // Initialize search
    new SearchManager();
    
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize tooltips (simple implementation)
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
});

// Tooltip functions
function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip absolute bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg z-50';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        document.body.removeChild(e.target._tooltip);
        delete e.target._tooltip;
    }
}

// Real-time updates simulation (you can integrate with WebSockets)
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Update notification badge
        const notificationButton = document.querySelector('button svg').parentElement;
        const badge = notificationButton.querySelector('.absolute');
        if (badge && Math.random() > 0.8) {
            badge.classList.add('animate-pulse');
            setTimeout(() => badge.classList.remove('animate-pulse'), 2000);
        }
    }, 30000);
}

// Start real-time updates
setTimeout(simulateRealTimeUpdates, 5000);

// Export for use in other scripts
window.CRMApp = {
    ThemeManager,
    Dropdown,
    NotificationManager,
    FormManager,
    SearchManager
};
