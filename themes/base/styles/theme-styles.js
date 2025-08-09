// Base Theme Styles
export const themeStyles = `
  /* Base Theme Global Styles */
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #fff;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 1rem 0;
    font-weight: 600;
    line-height: 1.2;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* Utility Classes */
  .text-primary {
    color: var(--color-primary, #6366f1);
  }

  .text-secondary {
    color: var(--color-secondary, #8b5cf6);
  }

  .bg-primary {
    background-color: var(--color-primary, #6366f1);
  }

  .bg-secondary {
    background-color: var(--color-secondary, #8b5cf6);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slideInUp {
    animation: slideInUp 0.5s ease-in-out;
  }
`;

export const componentStyles = `
  /* Component Specific Styles */
  
  /* Header Styles */
  .theme-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .theme-header.transparent {
    background: transparent;
    border-bottom: none;
  }

  /* Hero Styles */
  .theme-hero {
    position: relative;
    overflow: hidden;
  }

  .theme-hero-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  /* Product Card Styles */
  .theme-product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .theme-product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  /* Button Styles */
  .theme-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .theme-button-primary {
    background: var(--color-primary, #6366f1);
    color: white;
  }

  .theme-button-primary:hover {
    background: var(--color-primary-dark, #4f46e5);
  }

  .theme-button-secondary {
    background: transparent;
    color: var(--color-primary, #6366f1);
    border: 2px solid var(--color-primary, #6366f1);
  }

  .theme-button-secondary:hover {
    background: var(--color-primary, #6366f1);
    color: white;
  }

  /* Footer Styles */
  .theme-footer {
    background: #1f2937;
    color: #9ca3af;
    padding: 3rem 0 1.5rem;
  }

  .theme-footer a:hover {
    color: white;
  }

  /* Section Spacing */
  .theme-section {
    padding: 4rem 0;
  }

  @media (max-width: 768px) {
    .theme-section {
      padding: 2rem 0;
    }
  }

  /* Grid Layouts */
  .theme-grid {
    display: grid;
    gap: 1.5rem;
  }

  .theme-grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .theme-grid-3 {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .theme-grid-4 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  /* Responsive Utilities */
  @media (max-width: 640px) {
    .sm\\:hidden {
      display: none;
    }
  }

  @media (min-width: 768px) {
    .md\\:block {
      display: block;
    }
  }

  @media (min-width: 1024px) {
    .lg\\:flex {
      display: flex;
    }
  }
`;

export default {
  themeStyles,
  componentStyles
};