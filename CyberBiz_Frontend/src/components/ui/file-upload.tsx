import { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string; // URL or file preview
  onChange: (file: File | null, url?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  error?: string;
  label?: string;
  showUrlInput?: boolean;
  onUrlChange?: (url: string) => void;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  error,
  label = 'Upload Image',
  showUrlInput = true,
  onUrlChange,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [urlInput, setUrlInput] = useState<string>(value && value.startsWith('http') ? value : '');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  
  // Sync preview and urlInput when value prop changes (for edit mode)
  useEffect(() => {
    if (value !== undefined) {
      if (value) {
        setPreview(value);
        if (value.startsWith('http') || value.startsWith('/')) {
          setUrlInput(value);
          setUploadMode('url');
        } else {
          setUrlInput('');
          setUploadMode('upload');
        }
      } else {
        // If value is explicitly empty string, clear everything
        setPreview(null);
        setUrlInput('');
      }
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(file);
      setUrlInput('');
      setUploadMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreview(urlInput);
      onChange(null, urlInput);
      onUrlChange?.(urlInput);
      setUploadMode('url');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUrlInput('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 border border-border rounded-md overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Upload/URL Mode Toggle */}
      {!preview && showUrlInput && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={uploadMode === 'upload' ? 'default' : 'outline'}
            onClick={() => {
              setUploadMode('upload');
              setUrlInput('');
            }}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload from Computer
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            onClick={() => {
              setUploadMode('url');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="flex-1"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Use URL
          </Button>
        </div>
      )}

      {/* File Upload - Only show when upload mode is selected */}
      {!preview && uploadMode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className={cn('w-full', error && 'border-destructive')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      )}

      {/* URL Input - Only show when URL mode is selected */}
      {!preview && showUrlInput && uploadMode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-destructive'
              )}
            />
            {urlInput && (
              <Button type="button" onClick={handleUrlSubmit}>
                Use URL
              </Button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {uploadMode === 'upload' 
          ? `Upload an image file (max ${maxSize}MB)` 
          : 'Enter an image URL from the internet'}
      </p>
    </div>
  );
}

