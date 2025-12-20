import { useState, useEffect } from 'react';
import { Video, FileText, File, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { ProductResource } from '@/types';

interface ProductResourcesProps {
  productId: string;
  isDownloadable?: boolean;
}

export function ProductResources({ productId, isDownloadable = false }: ProductResourcesProps) {
  const [resources, setResources] = useState<ProductResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [productId]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserProductResources(productId);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (resource: ProductResource) => {
    if (!resource.file_path || !isDownloadable) {
      return;
    }

    try {
      setDownloadingId(resource.id);
      const blob = await apiService.downloadProductResource(productId, resource.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    } finally {
      setDownloadingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5" />;
      case 'FILE':
        return <File className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resources.length === 0) {
    return null; // Don't show section if no resources
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Course Resources</h3>
        <p className="text-sm text-muted-foreground">
          Access all videos, documents, and files for this course
        </p>
      </div>

      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getTypeIcon(resource.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground">
                  {resource.title || resource.file_name || resource.external_url || 'Untitled Resource'}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {resource.type}
                </Badge>
              </div>
              {resource.description && (
                <p className="text-sm text-muted-foreground mb-1">{resource.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {resource.external_url ? (
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    External Link
                  </span>
                ) : (
                  <>
                    {resource.file_name && <span>File: {resource.file_name}</span>}
                    {resource.file_size && <span>Size: {formatFileSize(resource.file_size)}</span>}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {resource.external_url ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </a>
                </Button>
              ) : (
                <>
                  {isDownloadable && resource.file_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resource)}
                      disabled={downloadingId === resource.id}
                    >
                      {downloadingId === resource.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  )}
                  {resource.download_url && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={resource.download_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

