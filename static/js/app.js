/**
 * Modern SaaS CRM - JavaScript Utilities
 */

// Theme management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    if (this.theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark');
    } else {
      html.removeAttribute('data-theme');
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', this.theme);
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }

  set(theme) {
    this.theme = theme;
    this.applyTheme();
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.toggle('-translate-x-full');
  }
  if (overlay) {
    overlay.classList.toggle('hidden');
  }
}

// Close mobile menu
function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.add('-translate-x-full');
  }
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Notification
function showNotification(message, type = 'info', duration = 3000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification notification-${type} animate-slide-in-right`;
  
  const bgColor = {
    'success': 'bg-green-50 border-green-200',
    'error': 'bg-red-50 border-red-200',
    'warning': 'bg-yellow-50 border-yellow-200',
    'info': 'bg-blue-50 border-blue-200'
  }[type] || 'bg-blue-50 border-blue-200';
  
  const textColor = {
    'success': 'text-green-800',
    'error': 'text-red-800',
    'warning': 'text-yellow-800',
    'info': 'text-blue-800'
  }[type] || 'text-blue-800';
  
  const iconColor = {
    'success': 'text-green-400',
    'error': 'text-red-400',
    'warning': 'text-yellow-400',
    'info': 'text-blue-400'
  }[type] || 'text-blue-400';

  notification.innerHTML = `
    <div class="border rounded-lg p-4 ${bgColor}">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
            ${getNotificationIcon(type)}
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium ${textColor}">${message}</p>
        </div>
        <button onclick="this.closest('.notification').remove()" class="text-sm font-medium ${textColor} hover:opacity-75">
          ×
        </button>
      </div>
    </div>
  `;

  container.appendChild(notification);

  if (duration > 0) {
    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  return notification;
}

function getNotificationIcon(type) {
  const icons = {
    'success': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />',
    'error': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />',
    'warning': '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />',
    'info': '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />'
  };
  return icons[type] || icons['info'];
}

// Table sorting
function sortTable(columnIndex, type = 'string') {
  const table = event.target.closest('table');
  if (!table) return;

  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const header = table.querySelector(`th:nth-child(${columnIndex + 1})`);
  
  const isAsc = header?.classList.contains('sort-asc');
  
  rows.sort((a, b) => {
    const aVal = a.cells[columnIndex].textContent.trim();
    const bVal = b.cells[columnIndex].textContent.trim();

    if (type === 'number') {
      return isAsc ? parseFloat(bVal) - parseFloat(aVal) : parseFloat(aVal) - parseFloat(bVal);
    } else if (type === 'date') {
      return isAsc ? new Date(bVal) - new Date(aVal) : new Date(aVal) - new Date(bVal);
    } else {
      return isAsc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
  });

  // Update header classes
  table.querySelectorAll('th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
  if (isAsc) {
    header?.classList.add('sort-desc');
  } else {
    header?.classList.add('sort-asc');
  }

  rows.forEach(row => tbody.appendChild(row));
}

// Modal management
class Modal {
  constructor(id) {
    this.modal = document.getElementById(id);
  }

  open() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.modal.classList.add('animate-fade-in');
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  toggle() {
    if (this.modal) {
      this.modal.classList.toggle('hidden');
    }
  }
}

// Dropdown menu
class Dropdown {
  constructor(triggerId, menuId) {
    this.trigger = document.getElementById(triggerId);
    this.menu = document.getElementById(menuId);
    this.setupListeners();
  }

  setupListeners() {
    if (this.trigger) {
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${this.trigger?.id}`) && !e.target.closest(`#${this.menu?.id}`)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.menu) {
      this.menu.classList.toggle('hidden');
    }
  }

  close() {
    if (this.menu) {
      this.menu.classList.add('hidden');
    }
  }

  open() {
    if (this.menu) {
      this.menu.classList.remove('hidden');
    }
  }
}

// Search functionality
function filterTable(inputId, tableId, columnIndex = -1) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('keyup', () => {
    const filter = input.value.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      let found = false;
      const cells = row.querySelectorAll('td');

      if (columnIndex >= 0) {
        found = cells[columnIndex].textContent.toLowerCase().includes(filter);
      } else {
        for (let cell of cells) {
          if (cell.textContent.toLowerCase().includes(filter)) {
            found = true;
            break;
          }
        }
      }

      row.style.display = found ? '' : 'none';
    });
  });
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
  
  // Close mobile menu when clicking overlay
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }
});

// Export for use in other scripts
window.ThemeManager = ThemeManager;
window.Modal = Modal;
window.Dropdown = Dropdown;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.showNotification = showNotification;
window.sortTable = sortTable;
window.filterTable = filterTable;
