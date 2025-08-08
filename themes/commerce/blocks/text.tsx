'use client';

import React from 'react';

interface TextProps {
  settings: {
    content?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
    transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    decoration?: 'none' | 'underline' | 'line-through';
    margin?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    maxWidth?: number;
    truncate?: boolean;
    animate?: boolean;
  };
}

export function Text({ settings }: TextProps) {
  const {
    content = 'Sample text content',
    tag = 'p',
    size = 'base',
    weight = 'normal',
    color = '#000000',
    align = 'left',
    lineHeight = 'normal',
    letterSpacing = 'normal',
    transform = 'none',
    decoration = 'none',
    margin = {},
    maxWidth,
    truncate = false,
    animate = false
  } = settings;

  const getSizeClass = () => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    };
    return sizeClasses[size];
  };

  const getWeightClass = () => {
    const weightClasses = {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black'
    };
    return weightClasses[weight];
  };

  const getAlignClass = () => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };
    return alignClasses[align];
  };

  const getLineHeightClass = () => {
    const lineHeightClasses = {
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose'
    };
    return lineHeightClasses[lineHeight];
  };

  const getLetterSpacingClass = () => {
    const letterSpacingClasses = {
      tighter: 'tracking-tighter',
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
      wider: 'tracking-wider',
      widest: 'tracking-widest'
    };
    return letterSpacingClasses[letterSpacing];
  };

  const getTransformClass = () => {
    const transformClasses = {
      none: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize'
    };
    return transformClasses[transform];
  };

  const getDecorationClass = () => {
    const decorationClasses = {
      none: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through'
    };
    return decorationClasses[decoration];
  };

  const getMarginStyle = () => {
    const style: React.CSSProperties = {};
    
    if (margin.top !== undefined) style.marginTop = `${margin.top}px`;
    if (margin.bottom !== undefined) style.marginBottom = `${margin.bottom}px`;
    if (margin.left !== undefined) style.marginLeft = `${margin.left}px`;
    if (margin.right !== undefined) style.marginRight = `${margin.right}px`;
    
    return style;
  };

  const classes = `
    ${getSizeClass()}
    ${getWeightClass()}
    ${getAlignClass()}
    ${getLineHeightClass()}
    ${getLetterSpacingClass()}
    ${getTransformClass()}
    ${getDecorationClass()}
    ${truncate ? 'truncate' : ''}
    ${animate ? 'transition-all duration-300 ease-in-out' : ''}
  `.trim().replace(/\s+/g, ' ');

  const style: React.CSSProperties = {
    color: color,
    maxWidth: maxWidth ? `${maxWidth}px` : undefined,
    ...getMarginStyle()
  };

  // Parse content for basic formatting
  const parseContent = (text: string) => {
    // Handle line breaks
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {index > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  };

  const Tag = tag as keyof JSX.IntrinsicElements;

  // Add specific styling for heading tags
  const getHeadingClasses = () => {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return 'font-semibold';
    }
    return '';
  };

  const finalClasses = `${classes} ${getHeadingClasses()}`.trim();

  return (
    <Tag 
      className={finalClasses}
      style={style}
    >
      {parseContent(content)}
    </Tag>
  );
}