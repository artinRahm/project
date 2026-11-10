/**
 * Theme Toggle Module
 * Handles light/dark mode switching with localStorage persistence
 */

(function() {
  'use strict';

  const THEME_KEY = 'theme-preference';
  const DARK_CLASS = 'dark-mode';
  const LIGHT_CLASS = 'light-mode';

  // Get initial theme from localStorage or system preference
  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      return saved;
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme to document
  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      html.classList.add(DARK_CLASS);
      html.classList.remove(LIGHT_CLASS);
      body.classList.add(DARK_CLASS);
      body.classList.remove(LIGHT_CLASS);
    } else {
      html.classList.add(LIGHT_CLASS);
      html.classList.remove(DARK_CLASS);
      body.classList.add(LIGHT_CLASS);
      body.classList.remove(DARK_CLASS);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#000000' : '#ffffff';
      document.head.appendChild(meta);
    }
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  // Set specific theme
  function setTheme(theme) {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    button.setAttribute('type', 'button');

    // Button styles
    button.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--toggle-bg, rgba(255, 255, 255, 0.1));
      backdrop-filter: blur(10px);
      transition: background 0.3s ease, transform 0.2s ease;
    `;

    // SVG icons
    const sunIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;" class="sun-icon">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;

    const moonIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;" class="moon-icon">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    button.innerHTML = sunIcon + moonIcon;
    button.addEventListener('click', toggleTheme);
    button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.1)');
    button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

    // Update icon visibility based on theme
    function updateIcons() {
      const isDark = document.documentElement.classList.contains(DARK_CLASS);
      button.querySelector('.sun-icon').style.display = isDark ? 'block' : 'none';
      button.querySelector('.moon-icon').style.display = isDark ? 'none' : 'block';
    }

    // Listen for theme changes
    window.addEventListener('themechange', updateIcons);
    updateIcons();

    document.body.appendChild(button);
    return button;
  }

  // Initialize theme on load
  function init() {
    const theme = getInitialTheme();
    applyTheme(theme);

    // Create toggle button after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createToggleButton);
    } else {
      createToggleButton();
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Expose public API
  window.ThemeToggle = {
    toggle: toggleTheme,
    setTheme: setTheme,
    getTheme: () => document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light',
    init: init
  };

  // Auto-initialize
  init();
})();