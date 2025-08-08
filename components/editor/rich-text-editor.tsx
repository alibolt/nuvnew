'use client';

import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Code, Quote, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');
    if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
    setActiveFormats(formats);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const formatCode = () => {
    execCommand('formatBlock', 'pre');
  };

  return (
    <div className="nuvi-border nuvi-rounded-lg nuvi-overflow-hidden">
      {/* Toolbar */}
      <div className="nuvi-border-b nuvi-bg-muted/50 nuvi-p-sm nuvi-flex nuvi-flex-wrap nuvi-gap-xs">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className={`nuvi-btn nuvi-btn-sm nuvi-btn-ghost ${activeFormats.has('bold') ? 'nuvi-bg-primary/10' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className={`nuvi-btn nuvi-btn-sm nuvi-btn-ghost ${activeFormats.has('italic') ? 'nuvi-bg-primary/10' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className={`nuvi-btn nuvi-btn-sm nuvi-btn-ghost ${activeFormats.has('underline') ? 'nuvi-bg-primary/10' : ''}`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-border nuvi-mx-xs" />
        
        <button
          type="button"
          onClick={() => formatHeading(1)}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => formatHeading(2)}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-border nuvi-mx-xs" />
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className={`nuvi-btn nuvi-btn-sm nuvi-btn-ghost ${activeFormats.has('unorderedList') ? 'nuvi-bg-primary/10' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className={`nuvi-btn nuvi-btn-sm nuvi-btn-ghost ${activeFormats.has('orderedList') ? 'nuvi-bg-primary/10' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-border nuvi-mx-xs" />
        
        <button
          type="button"
          onClick={insertLink}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertQuote}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={formatCode}
          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onSelect={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        className="nuvi-min-h-[400px] nuvi-p-md nuvi-outline-none nuvi-prose nuvi-prose-sm nuvi-max-w-none"
        style={{ minHeight: '400px' }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );
}