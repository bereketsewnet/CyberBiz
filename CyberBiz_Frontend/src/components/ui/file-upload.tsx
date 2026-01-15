import { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Video, File, FileIcon } from 'lucide-react';
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
  const [urlInput, setUrlInput] = useState<string>((value && typeof value === 'string' && value.startsWith('http')) ? value : '');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>((value && typeof value === 'string' && value.startsWith('http')) ? 'url' : 'upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'pdf' | 'document' | 'other' | null>(null);

  const getFileType = (file: File): 'image' | 'video' | 'pdf' | 'document' | 'other' => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name)) {
      return 'image';
    }
    if (type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv)$/i.test(name)) {
      return 'video';
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (type.includes('document') || type.includes('word') || type.includes('text') || 
        /\.(doc|docx|txt|rtf|odt)$/i.test(name)) {
      return 'document';
    }
    return 'other';
  };

  // Sync preview and urlInput when value prop changes (for edit mode)
  // Only sync if value is an external URL (not a blob URL from file selection)
  useEffect(() => {
    if (value !== undefined) {
      // Ensure value is a string before calling startsWith
      const stringValue = typeof value === 'string' ? value : '';
      // Only sync if it's an external URL (http/https)
      if (stringValue && (stringValue.startsWith('http') || stringValue.startsWith('/'))) {
        // External URL - sync everything
        if (preview !== stringValue) {
          setPreview(stringValue);
        }
        setUrlInput(stringValue);
        setUploadMode('url');
        setFileType(null);
        setSelectedFile(null);
      } else if (stringValue && stringValue.startsWith('blob:')) {
        // Blob URL - only update if preview is different and we don't have a selectedFile
        // This prevents clearing when user selects a file
        if (preview !== stringValue && !selectedFile) {
          setPreview(stringValue);
        }
        setUrlInput('');
        setUploadMode('upload');
      } else if (!stringValue && !selectedFile) {
        // Empty value and no selected file - clear everything
        setPreview(null);
        setUrlInput('');
        setFileType(null);
      }
      // If we have a selectedFile, don't let the value prop override it
      // (this means user just selected a file, preserve it)
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

    const detectedType = getFileType(file);
    setSelectedFile(file);
    setFileType(detectedType);

    // Create preview based on file type
    if (detectedType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(file, undefined);
        setUrlInput('');
        setUploadMode('upload');
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, create a blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      setPreview(blobUrl);
      onChange(file, undefined);
      setUrlInput('');
      setUploadMode('upload');
    }
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
    setSelectedFile(null);
    setFileType(null);
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
          {fileType === 'image' ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : fileType === 'video' ? (
            <video
              src={preview}
              controls
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : fileType === 'pdf' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileText className="w-16 h-16 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{selectedFile?.name || 'PDF Document'}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF files will be available for download</p>
            </div>
          ) : fileType === 'document' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileText className="w-16 h-16 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{selectedFile?.name || 'Document'}</p>
              <p className="text-xs text-muted-foreground mt-1">Document files will be available for download</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <FileIcon className="w-16 h-16 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{selectedFile?.name || 'File'}</p>
              <p className="text-xs text-muted-foreground mt-1">File will be available for download</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
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

