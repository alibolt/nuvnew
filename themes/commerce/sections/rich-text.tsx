'use client';

import React from 'react';

interface RichTextProps {
  settings: {
    content?: string;
    maxWidth?: 'narrow' | 'medium' | 'wide' | 'full';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    backgroundColor?: string;
    textColor?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
    customCSS?: string;
  };
  isPreview?: boolean;
}

export function RichText({ settings, isPreview }: RichTextProps) {
  const {
    content = '<h2>Add Your Content Here</h2><p>Use the rich text editor to format your content with headings, paragraphs, lists, links, and more.</p>',
    maxWidth = 'medium',
    textAlign = 'center',
    backgroundColor = '#ffffff',
    textColor = '#111827',
    padding = 'large',
    customCSS = ''
  } = settings;

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'wide': return 'max-w-6xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-4xl';
    }
  };

  const getTextAlignClass = () => {
    switch (textAlign) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-center';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return 'py-0';
      case 'small': return 'py-8';
      case 'medium': return 'py-12';
      case 'large': return 'py-16';
      default: return 'py-16';
    }
  };

  // Default styles for rich text content
  const richTextStyles = `
    .rich-text-content h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
    .rich-text-content h2 { font-size: 2rem; font-weight: 600; margin-bottom: 0.875rem; line-height: 1.3; }
    .rich-text-content h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; line-height: 1.4; }
    .rich-text-content h4 { font-size: 1.25rem; font-weight: 500; margin-bottom: 0.625rem; line-height: 1.5; }
    .rich-text-content h5 { font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem; line-height: 1.5; }
    .rich-text-content h6 { font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem; line-height: 1.5; }
    
    .rich-text-content p { margin-bottom: 1rem; line-height: 1.7; }
    .rich-text-content p:last-child { margin-bottom: 0; }
    
    .rich-text-content ul, .rich-text-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .rich-text-content ul { list-style-type: disc; }
    .rich-text-content ol { list-style-type: decimal; }
    .rich-text-content li { margin-bottom: 0.5rem; line-height: 1.6; }
    
    .rich-text-content a { color: #2563eb; text-decoration: underline; transition: color 0.2s; }
    .rich-text-content a:hover { color: #1d4ed8; }
    
    .rich-text-content blockquote { 
      border-left: 4px solid #e5e7eb; 
      padding-left: 1rem; 
      margin: 1.5rem 0; 
      font-style: italic; 
      color: #6b7280;
    }
    
    .rich-text-content hr { 
      border: none; 
      border-top: 1px solid #e5e7eb; 
      margin: 2rem 0; 
    }
    
    .rich-text-content img { 
      max-width: 100%; 
      height: auto; 
      margin: 1.5rem auto; 
      display: block; 
      border-radius: 0.5rem;
    }
    
    .rich-text-content table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1.5rem 0; 
    }
    
    .rich-text-content th, .rich-text-content td { 
      border: 1px solid #e5e7eb; 
      padding: 0.75rem; 
      text-align: left; 
    }
    
    .rich-text-content th { 
      background-color: #f9fafb; 
      font-weight: 600; 
    }
    
    .rich-text-content code { 
      background-color: #f3f4f6; 
      padding: 0.125rem 0.375rem; 
      border-radius: 0.25rem; 
      font-family: monospace; 
      font-size: 0.875em; 
    }
    
    .rich-text-content pre { 
      background-color: #1f2937; 
      color: #f9fafb; 
      padding: 1rem; 
      border-radius: 0.5rem; 
      overflow-x: auto; 
      margin: 1.5rem 0; 
    }
    
    .rich-text-content pre code { 
      background-color: transparent; 
      padding: 0; 
      color: inherit; 
    }

    ${customCSS}
  `;

  return (
    <section 
      className={getPaddingClass()}
      style={{ 
        backgroundColor,
        color: textColor
      }}
    >
      <style jsx>{richTextStyles}</style>
      
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className={`${getMaxWidthClass()} mx-auto`}>
          <div 
            className={`rich-text-content ${getTextAlignClass()}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </section>
  );
}export default RichUtext;
