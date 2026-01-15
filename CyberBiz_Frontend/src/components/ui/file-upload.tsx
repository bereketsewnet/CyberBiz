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
  // Helper function to detect if a URL is an image
  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    // Check for data URLs (from FileReader)
    if (url.startsWith('data:image/')) {
      return true;
    }
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i;
    return imageExtensions.test(url) || url.includes('image') || url.includes('img');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFileSelectionModeRef = useRef<boolean>(false);
  const lastFileSelectedPreviewRef = useRef<string | null>(null);
  const initialValue = value || null;
  const isInitialImageUrl = initialValue && typeof initialValue === 'string' && (initialValue.startsWith('http') || initialValue.startsWith('/')) && (isImageUrl(initialValue) || accept?.includes('image'));
  const [preview, setPreview] = useState<string | null>(initialValue);
  const [urlInput, setUrlInput] = useState<string>((initialValue && typeof initialValue === 'string' && (initialValue.startsWith('http') || initialValue.startsWith('/'))) ? initialValue : '');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>((initialValue && typeof initialValue === 'string' && (initialValue.startsWith('http') || initialValue.startsWith('/'))) ? 'url' : 'upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'pdf' | 'document' | 'other' | null>(isInitialImageUrl ? 'image' : null);

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
  // Only sync if value is an external URL (not a blob/data URL from file selection)
  useEffect(() => {
    // If we have a preview from file selection stored in ref, NEVER override it
    if (lastFileSelectedPreviewRef.current) {
      // Ensure preview matches the ref
      if (preview !== lastFileSelectedPreviewRef.current) {
        setPreview(lastFileSelectedPreviewRef.current);
      }
      return;
    }

    // If we're in file selection mode, don't let the value prop override it
    // (this means user just selected a file, preserve it)
    if (isFileSelectionModeRef.current || selectedFile) {
      return;
    }
    
    // If preview is a blob URL or data URL (from file selection), don't override it
    // This check is critical - even if selectedFile becomes false, we don't want to override data/blob URLs
    if (preview && (preview.startsWith('blob:') || preview.startsWith('data:'))) {
      // Store this in ref so we remember it across renders
      lastFileSelectedPreviewRef.current = preview;
      return;
    }
    
    if (value !== undefined) {
      // Ensure value is a string before calling startsWith
      const stringValue = typeof value === 'string' ? value : '';
      
      // BEFORE syncing, check if we have a file-selected preview that should be preserved
      // This prevents the old URL in value prop from overriding the new file preview
      const hasFileSelectedPreview = lastFileSelectedPreviewRef.current || 
                                     preview?.startsWith('data:') || 
                                     preview?.startsWith('blob:') ||
                                     selectedFile ||
                                     isFileSelectionModeRef.current;
      
      // If we have a file-selected preview, never override it with the value prop
      if (hasFileSelectedPreview) {
        return;
      }
      
      // Only sync if it's an external URL (http/https)
      if (stringValue && (stringValue.startsWith('http') || stringValue.startsWith('/'))) {
        // External URL - sync everything
        if (preview !== stringValue) {
          setPreview(stringValue);
        }
        setUrlInput(stringValue);
        setUploadMode('url');
        // Detect if it's an image URL and set fileType accordingly
        if (isImageUrl(stringValue) || accept?.includes('image')) {
          setFileType('image');
        } else {
          setFileType(null);
        }
      } else if (stringValue && stringValue.startsWith('blob:')) {
        // Blob URL - only update if preview is different
        if (preview !== stringValue) {
          setPreview(stringValue);
        }
        setUrlInput('');
        setUploadMode('upload');
        // For blob URLs from file selection, fileType should already be set
      } else if (!stringValue) {
        // Empty value - clear everything
        setPreview(null);
        setUrlInput('');
        setFileType(null);
      }
    }
  }, [value, accept, selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    const detectedType = getFileType(file);
    // Set file selection mode to prevent useEffect from overriding
    isFileSelectionModeRef.current = true;
    setSelectedFile(file);
    setFileType(detectedType);

    // Create preview based on file type
    if (detectedType === 'image') {
      // Create a temporary blob URL immediately so useEffect can detect file selection
      const tempBlobUrl = URL.createObjectURL(file);
      lastFileSelectedPreviewRef.current = tempBlobUrl;
      setPreview(tempBlobUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Update the ref and preview to the data URL (better than blob URL)
        lastFileSelectedPreviewRef.current = result;
        setPreview(result);
        // Clean up the temporary blob URL
        URL.revokeObjectURL(tempBlobUrl);
        onChange(file, undefined);
        setUrlInput('');
        setUploadMode('upload');
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, create a blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      // Store the preview in ref so useEffect can't override it
      lastFileSelectedPreviewRef.current = blobUrl;
      setPreview(blobUrl);
      onChange(file, undefined);
      setUrlInput('');
      setUploadMode('upload');
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // Exit file selection mode when URL is submitted
      isFileSelectionModeRef.current = false;
      lastFileSelectedPreviewRef.current = null; // Clear the ref
      setSelectedFile(null);
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
    isFileSelectionModeRef.current = false;
    lastFileSelectedPreviewRef.current = null; // Clear the ref
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
          {(fileType === 'image' || (!fileType && isImageUrl(preview))) ? (
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

