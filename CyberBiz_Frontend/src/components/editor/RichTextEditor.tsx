import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  type?: 'job' | 'product';
}

const jobDefaultTemplate = `
<h2>Job Description</h2>
<p>We are looking for a talented professional to join our team...</p>

<h3>Requirements:</h3>
<ul>
  <li>Requirement 1</li>
  <li>Requirement 2</li>
  <li>Requirement 3</li>
</ul>

<h3>Benefits:</h3>
<ul>
  <li>Benefit 1</li>
  <li>Benefit 2</li>
  <li>Benefit 3</li>
</ul>
`.trim();

const productDefaultTemplate = `
<h2>Overview</h2>
<p>This course/book provides comprehensive training on the subject...</p>

<h3>What You'll Learn:</h3>
<ul>
  <li>Key concept 1</li>
  <li>Key concept 2</li>
  <li>Key concept 3</li>
</ul>

<h3>Requirements:</h3>
<ul>
  <li>Basic understanding required</li>
  <li>Access to necessary tools/software</li>
</ul>
`.trim();

export function RichTextEditor({ value, onChange, placeholder, className, error, type = 'job' }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const defaultTemplate = type === 'product' ? productDefaultTemplate : jobDefaultTemplate;
  const initializedRef = useRef(false);

  useEffect(() => {
    // Set default template only once when component mounts if value is empty
    if (!initializedRef.current && (!value || value.trim() === '')) {
      initializedRef.current = true;
      onChange(defaultTemplate);
    }
  }, [value, defaultTemplate, onChange]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'border border-border rounded-md bg-background',
        error && 'border-destructive'
      )}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || defaultTemplate}
          onChange={onChange}
          placeholder={placeholder || (type === 'product' ? 'Enter product description...' : 'Enter job description...')}
          modules={modules}
          formats={formats}
          className="[&_.ql-editor]:min-h-[300px] [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:bg-muted/50"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Use the toolbar above to format your text (bold, italic, underline, lists, etc.)
      </p>
    </div>
  );
}

