import { GripVertical, Video, FileText, File, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductResource } from '@/types';
import { cn } from '@/lib/utils';

interface ResourceItemProps {
  resource: ProductResource;
  onEdit: () => void;
  onDelete: () => void;
  dragHandleProps?: any; // For react-beautiful-dnd or similar
}

export function ResourceItem({ resource, onEdit, onDelete, dragHandleProps }: ResourceItemProps) {
  const getTypeIcon = () => {
    switch (resource.type) {
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />;
      case 'FILE':
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getTypeBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      VIDEO: 'default',
      DOCUMENT: 'secondary',
      FILE: 'outline',
    };
    return (
      <Badge variant={variants[resource.type] || 'outline'}>
        {resource.type}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const displayName = resource.title || resource.file_name || resource.external_url || 'Untitled Resource';

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Type Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {getTypeIcon()}
      </div>

      {/* Resource Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">{displayName}</p>
          {getTypeBadge()}
        </div>
        {resource.description && (
          <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
        )}
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          {resource.external_url ? (
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              External URL
            </span>
          ) : (
            <span>File: {resource.file_name || 'N/A'}</span>
          )}
          {resource.file_size && (
            <span>Size: {formatFileSize(resource.file_size)}</span>
          )}
          <span>Order: {resource.order}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

