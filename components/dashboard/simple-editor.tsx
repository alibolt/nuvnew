'use client';

import { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Link, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Code, Quote
} from 'lucide-react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleEditor({ value, onChange, placeholder, className }: SimpleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-p-sm nuvi-border nuvi-border-b-0 nuvi-rounded-t-lg nuvi-bg-gray-50">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-gray-300 nuvi-mx-xs" />
        <button
          type="button"
          onClick={() => handleFormat('insertUnorderedList')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('insertOrderedList')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-gray-300 nuvi-mx-xs" />
        <button
          type="button"
          onClick={() => handleFormat('justifyLeft')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('justifyCenter')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('justifyRight')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-gray-300 nuvi-mx-xs" />
        <button
          type="button"
          onClick={insertLink}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('formatBlock', '<blockquote>')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('formatBlock', '<pre>')}
          className="nuvi-p-xs nuvi-rounded nuvi-hover:bg-gray-200 nuvi-transition-colors"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
        <div className="nuvi-w-px nuvi-h-6 nuvi-bg-gray-300 nuvi-mx-xs" />
        <select
          onChange={(e) => handleFormat('formatBlock', e.target.value)}
          className="nuvi-px-sm nuvi-py-xs nuvi-border nuvi-rounded nuvi-text-sm"
          defaultValue=""
        >
          <option value="" disabled>Format</option>
          <option value="<p>">Paragraph</option>
          <option value="<h1>">Heading 1</option>
          <option value="<h2>">Heading 2</option>
          <option value="<h3>">Heading 3</option>
        </select>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        className="nuvi-min-h-[350px] nuvi-p-md nuvi-border nuvi-rounded-b-lg nuvi-bg-white focus:nuvi-outline-none focus:nuvi-ring-2 focus:nuvi-ring-primary"
        style={{ minHeight: '350px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}