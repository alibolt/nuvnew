import React from 'react';

interface ContextAwareSuggestionsProps {
  activeTab?: string;
  setAiInput: (input: string) => void;
  sendAiMessage: () => void;
}

export function ContextAwareSuggestions({ activeTab, setAiInput, sendAiMessage }: ContextAwareSuggestionsProps) {
  const handleCommand = (command: string) => {
    setAiInput(command);
    setTimeout(() => sendAiMessage(), 100);
  };

  const buttonStyle = {
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontSize: '14px',
    color: '#374151',
    transition: 'all 0.2s',
    width: '100%',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: 'white',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  // Products Page
  if (activeTab === 'products') {
    return (
      <>
        <button
          onClick={() => handleCommand('Create product "Summer T-Shirt" price 29.99')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🛍️ Create a new product
        </button>
        <button
          onClick={() => handleCommand('Activate all draft products')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ✅ Activate draft products
        </button>
        <button
          onClick={() => handleCommand('Add tag "NEW" to all recent products')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🏷️ Add tags to products
        </button>
        <button
          onClick={() => handleCommand('Export products to CSV')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📥 Export product list
        </button>
      </>
    );
  }

  // Orders Page
  if (activeTab === 'orders') {
    return (
      <>
        <button
          onClick={() => handleCommand('Show pending orders')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📦 View pending orders
        </button>
        <button
          onClick={() => handleCommand('Show today orders')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📊 Today's orders
        </button>
        <button
          onClick={() => handleCommand('Show store analytics')}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          📈 View sales insights
        </button>
      </>
    );
  }

  // Customers Page
  if (activeTab === 'customers') {
    return (
      <>
        <button
          onClick={() => handleCommand('Show top customers')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ⭐ Show top customers
        </button>
        <button
          onClick={() => handleCommand('Show new customers this month')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          👥 New customers
        </button>
        <button
          onClick={() => handleCommand('Show store analytics')}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          📊 Customer insights
        </button>
      </>
    );
  }

  // Marketing Page
  if (activeTab === 'marketing') {
    return (
      <>
        <button
          onClick={() => handleCommand('Create discount code "SUMMER20" for 20% off')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🏷️ Generate discount code
        </button>
        <button
          onClick={() => handleCommand('Create email campaign for summer sale')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ✉️ Email campaign
        </button>
        <button
          onClick={() => handleCommand('Generate Instagram post for new collection')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📱 Social media post
        </button>
      </>
    );
  }

  // Analytics Page
  if (activeTab === 'analytics') {
    return (
      <>
        <button
          onClick={() => handleCommand('Show store analytics')}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          📊 View store insights
        </button>
        <button
          onClick={() => handleCommand('What are my best selling products?')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🏆 Top products
        </button>
        <button
          onClick={() => handleCommand('Compare this week to last week')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📈 Weekly comparison
        </button>
      </>
    );
  }

  // Settings Page
  if (activeTab === 'settings') {
    return (
      <>
        <button
          onClick={() => handleCommand('Update currency to EUR')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          💱 Change currency
        </button>
        <button
          onClick={() => handleCommand('Set tax rate to 18%')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🧾 Update tax rate
        </button>
        <button
          onClick={() => handleCommand('Change shipping rate to $10')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📦 Shipping settings
        </button>
        <button
          onClick={() => handleCommand('Enable maintenance mode')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🔧 Maintenance mode
        </button>
      </>
    );
  }

  // Themes Page
  if (activeTab === 'themes') {
    return (
      <>
        <button
          onClick={() => handleCommand('Change primary color to blue')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🎨 Change colors
        </button>
        <button
          onClick={() => handleCommand('Update font to Inter')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🔤 Change typography
        </button>
        <button
          onClick={() => handleCommand('Add hero banner to homepage')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🖼️ Add sections
        </button>
      </>
    );
  }

  // Translations Page
  if (activeTab === 'translations') {
    return (
      <>
        <button
          onClick={() => handleCommand('Translate all products to Turkish')}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          🌍 Translate all products
        </button>
        <button
          onClick={() => handleCommand('Translate categories to Spanish')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          📁 Translate categories
        </button>
        <button
          onClick={() => handleCommand('Translate product "Summer Dress" to French')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🛍️ Translate specific product
        </button>
        <button
          onClick={() => handleCommand('Show untranslated products')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ⚠️ Find untranslated content
        </button>
      </>
    );
  }

  // Default/Overview Page
  return (
    <>
      <button
        onClick={() => handleCommand('Create product "Summer T-Shirt" price 29.99')}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        🛍️ Create a new product
      </button>
      <button
        onClick={() => handleCommand('Create discount code "SUMMER20" for 20% off')}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        🏷️ Generate discount code
      </button>
      <button
        onClick={() => handleCommand('Show store analytics')}
        style={primaryButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        📊 View store insights
      </button>
    </>
  );
}