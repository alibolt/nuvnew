// Commerce Theme Styles
export const themeStyles = `
  /* Base Theme Styles */
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  
  * {
    box-sizing: border-box;
  }
`;

export const componentStyles = `
  /* Component Styles */
  .theme-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .theme-footer {
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }
  
  .theme-button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .theme-button-primary {
    background: #3b82f6;
    color: white;
  }
  
  .theme-button-primary:hover {
    background: #2563eb;
  }
`;

export default {
  themeStyles,
  componentStyles
};