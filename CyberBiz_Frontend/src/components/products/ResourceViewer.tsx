import { useState, useEffect } from 'react';
import { X, Download, FileText, Video, Image as ImageIcon, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/apiService';
import type { ProductResource } from '@/types';

interface ResourceViewerProps {
  resource: ProductResource;
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDownloadable?: boolean;
}

export function ResourceViewer({
  resource,
  productId,
  open,
  onOpenChange,
  isDownloadable = false,
}: ResourceViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && resource) {
      loadViewerUrl();
    } else {
      setViewerUrl(null);
      setError(null);
    }
  }, [open, resource, productId]);

  const loadViewerUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (resource.external_url) {
        // For external URLs, use them directly
        setViewerUrl(resource.external_url);
        setIsLoading(false);
        return;
      }

      if (!resource.file_path) {
        setError('No file available to view');
        setIsLoading(false);
        return;
      }

      // Get the view URL from the API (for viewing, not downloading)
      const blob = await apiService.viewProductResource(productId, resource.id);
      const url = window.URL.createObjectURL(blob);
      setViewerUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading resource:', err);
      setError('Failed to load resource');
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!isDownloadable || !resource.file_path) {
      return;
    }

    try {
      const blob = await apiService.downloadProductResource(productId, resource.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading resource:', err);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (viewerUrl && viewerUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(viewerUrl);
      }
    };
  }, [viewerUrl]);

  const getFileType = (): 'video' | 'pdf' | 'image' | 'document' | 'other' => {
    // First, check the resource type field (VIDEO, DOCUMENT, FILE)
    const resourceType = resource.type?.toUpperCase();
    const fileName = resource.file_name?.toLowerCase() || '';
    const mimeType = resource.mime_type?.toLowerCase() || '';

    // Check for archives/compressed files first (ZIP, RAR, etc.) - these can't be previewed
    if (
      mimeType === 'application/zip' ||
      mimeType === 'application/x-zip-compressed' ||
      mimeType === 'application/x-rar-compressed' ||
      mimeType === 'application/x-7z-compressed' ||
      mimeType === 'application/gzip' ||
      /\.(zip|rar|7z|tar|gz)$/i.test(fileName)
    ) {
      return 'other'; // Archives need to be downloaded
    }

    // Use resource type as primary indicator (but verify with mime type)
    if (resourceType === 'VIDEO') {
      // Double-check with file extension/mime type
      if (mimeType.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v)$/i.test(fileName)) {
        return 'video';
      }
      // If resource type is VIDEO but no file extension, assume video
      return 'video';
    }
    
    // Check for PDF (highest priority after VIDEO type)
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf';
    }
    
    // Check for video (if not already detected by type)
    if (mimeType.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v)$/i.test(fileName)) {
      return 'video';
    }
    
    // Check for audio (treat as video for player)
    if (mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(fileName)) {
      return 'video'; // Use video player for audio
    }
    
    // Check for images
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(fileName)) {
      return 'image';
    }
    
    // Check for documents (DOCX, XLSX, PPTX, etc.)
    // But exclude ZIP files that might be misclassified
    if (
      (resourceType === 'DOCUMENT' && mimeType !== 'application/zip') ||
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('msword') ||
      mimeType.includes('ms-excel') ||
      mimeType.includes('ms-powerpoint') ||
      mimeType === 'application/vnd.openxmlformats-officedocument' ||
      /\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp|rtf|txt)$/i.test(fileName)
    ) {
      return 'document';
    }
    
    // If resource type is DOCUMENT but no file extension, check mime type
    // If mime type is unknown or archive, treat as other
    if (resourceType === 'DOCUMENT') {
      // If we have a mime type that's not an archive, assume document
      if (mimeType && !mimeType.includes('zip') && !mimeType.includes('compressed')) {
        return 'document';
      }
      // Otherwise, it's likely misclassified, treat as other
      return 'other';
    }
    
    // If resource type is FILE, try to detect from file name
    if (resourceType === 'FILE' && fileName) {
      // Try to detect based on extension
      if (fileName.endsWith('.pdf')) return 'pdf';
      if (/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v)$/i.test(fileName)) return 'video';
      if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(fileName)) return 'image';
      if (/\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp|rtf|txt)$/i.test(fileName)) return 'document';
    }
    
    // Default to other
    return 'other';
  };

  const fileType = getFileType();

  const renderViewer = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }

    if (!viewerUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No preview available</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'video':
        // Check if it's actually audio
        const isAudio = resource.mime_type?.startsWith('audio/') || 
                       /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(resource.file_name || '');
        
        if (isAudio) {
          return (
            <div className="w-full">
              <audio
                src={viewerUrl}
                controls
                className="w-full"
                autoPlay={false}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          );
        }
        
        return (
          <div className="w-full">
            <video
              src={viewerUrl}
              controls
              className="w-full h-auto max-h-[80vh] rounded-lg"
              autoPlay={false}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-[80vh] border border-border rounded-lg overflow-hidden">
            <iframe
              src={viewerUrl}
              className="w-full h-full"
              title={resource.title || 'PDF Viewer'}
            />
          </div>
        );

      case 'image':
        return (
          <div className="w-full flex items-center justify-center">
            <img
              src={viewerUrl}
              alt={resource.title || 'Image'}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
          </div>
        );

      case 'document':
        // Check if it's actually an archive file (ZIP, etc.) that was misclassified
        const isArchive = resource.mime_type?.toLowerCase().includes('zip') ||
                         resource.mime_type?.toLowerCase().includes('compressed') ||
                         /\.(zip|rar|7z|tar|gz)$/i.test(resource.file_name || '');
        
        if (isArchive) {
          // Archives can't be previewed, show download message
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  This is a compressed archive file
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Please download and extract the file to view its contents
                </p>
                {isDownloadable && (
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Archive
                  </Button>
                )}
              </div>
            </div>
          );
        }
        
        // For documents, if it's an external URL, try Google Docs Viewer
        // Otherwise, show a message that download is needed
        if (resource.external_url || viewerUrl.startsWith('http')) {
          const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(viewerUrl)}&embedded=true`;
          return (
            <div className="w-full h-[80vh] border border-border rounded-lg overflow-hidden">
              <iframe
                src={googleDocsUrl}
                className="w-full h-full"
                title={resource.title || 'Document Viewer'}
              />
            </div>
          );
        } else {
          // For blob URLs (local files), Google Docs Viewer won't work
          // Show a message to download instead
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Document preview is not available for this file type
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Please download the file to view it
                </p>
                {isDownloadable && (
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                )}
              </div>
            </div>
          );
        }

      default:
        // Check if it's an archive file
        const isArchiveFile = resource.mime_type?.toLowerCase().includes('zip') ||
                             resource.mime_type?.toLowerCase().includes('compressed') ||
                             /\.(zip|rar|7z|tar|gz)$/i.test(resource.file_name || '');
        
        if (isArchiveFile) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  This is a compressed archive file
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Please download and extract the file to view its contents
                </p>
                {isDownloadable && (
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Archive
                  </Button>
                )}
              </div>
            </div>
          );
        }
        
        // For FILE type resources, try to show in iframe as fallback
        // This might work for some file types (like HTML files)
        if (resource.type === 'FILE' && viewerUrl && resource.mime_type?.includes('text/html')) {
          return (
            <div className="w-full h-[80vh] border border-border rounded-lg overflow-hidden">
              <iframe
                src={viewerUrl}
                className="w-full h-full"
                title={resource.title || 'File Viewer'}
              />
              {isDownloadable && (
                <div className="absolute bottom-4 right-4">
                  <Button onClick={handleDownload} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Preview not available for this file type
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {resource.file_name ? `File: ${resource.file_name}` : 'Please download the file to view it'}
                {resource.mime_type && (
                  <span className="block mt-1 text-xs">Type: {resource.mime_type}</span>
                )}
              </p>
              {isDownloadable && (
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download to View
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {fileType === 'video' && <Video className="w-5 h-5" />}
                {fileType === 'pdf' && <FileText className="w-5 h-5" />}
                {fileType === 'image' && <ImageIcon className="w-5 h-5" />}
                {fileType === 'document' && <FileText className="w-5 h-5" />}
                {fileType === 'other' && <File className="w-5 h-5" />}
                {resource.title || resource.file_name || 'Resource Viewer'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                View resource: {resource.title || resource.file_name || 'Resource'}
              </DialogDescription>
            </div>
            {isDownloadable && resource.file_path && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">{renderViewer()}</div>
      </DialogContent>
    </Dialog>
  );
}


