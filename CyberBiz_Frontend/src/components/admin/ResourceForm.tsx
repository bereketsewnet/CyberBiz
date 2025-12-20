import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import type { ProductResource } from '@/types';

const resourceSchema = z.object({
  type: z.enum(['VIDEO', 'DOCUMENT', 'FILE']),
  title: z.string().optional(),
  description: z.string().optional(),
  external_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  order: z.number().min(0).optional().default(0),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    type: 'VIDEO' | 'DOCUMENT' | 'FILE';
    title?: string;
    description?: string;
    file?: File;
    external_url?: string;
    order?: number;
  }) => Promise<void>;
  resource?: ProductResource | null;
  defaultOrder?: number;
}

export function ResourceForm({
  open,
  onOpenChange,
  onSubmit,
  resource,
  defaultOrder = 0,
}: ResourceFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const prevOpenRef = useRef(open);
  
  // Track when open prop changes unexpectedly
  useEffect(() => {
    if (prevOpenRef.current !== open) {
      const wasOpen = prevOpenRef.current;
      const isNowOpen = open;
      // If dialog was open and now it's closed, but we didn't expect it
      if (wasOpen && !isNowOpen && (isInitializing || isSubmitting)) {
        // Force it back open by calling onOpenChange with true
        setTimeout(() => {
          onOpenChange(true);
        }, 0);
        return; // Don't update the ref yet
      }
      
      prevOpenRef.current = open;
    }
  }, [open, isInitializing, isSubmitting, onOpenChange]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: 'FILE',
      title: '',
      description: '',
      external_url: '',
      order: defaultOrder,
    },
  });

  const type = watch('type');
  const externalUrl = watch('external_url');

  // Reset form when dialog opens or resource changes (only when open is true)
  useEffect(() => {
    if (!open) {
      return; // Don't do anything if dialog is closed
    }
    
    setIsInitializing(true); // Set initializing flag to prevent dialog from closing
    setIsSubmitting(false); // Reset submitting state when dialog opens
    
    // Use setTimeout to ensure this happens after dialog is fully rendered
    const timeoutId = setTimeout(() => {
      try {
        if (resource) {
          // Editing existing resource
          setValue('type', resource.type, { shouldValidate: false });
          setValue('title', resource.title || '', { shouldValidate: false });
          setValue('description', resource.description || '', { shouldValidate: false });
          setValue('external_url', resource.external_url || '', { shouldValidate: false });
          setValue('order', resource.order, { shouldValidate: false });
          setUploadMode(resource.external_url ? 'url' : 'file');
          setFile(null);
        } else {
          // Adding new resource - reset form
          reset({
            type: 'FILE',
            title: '',
            description: '',
            external_url: '',
            order: defaultOrder,
          }, { keepErrors: false, keepDirty: false, keepIsSubmitted: false, keepTouched: false, keepIsValid: false, keepSubmitCount: false });
          setUploadMode('file');
          setFile(null);
        }
      } catch (error) {
        console.error('Error during form initialization:', error);
      }
      // Note: We DON'T clear isInitializing here
      // It will be cleared when user interacts with the form (see handlers below)
      // This prevents the dialog from closing right after opening
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      setIsInitializing(false);
    };
  }, [open, resource, setValue, reset, defaultOrder]);

  const onFormSubmit = async (data: ResourceFormData) => {
    // Prevent submission if already submitting
    if (isSubmitting) {
      return;
    }

    // Validate that either file or external_url is provided based on mode
    const hasFile = uploadMode === 'file' && file !== null;
    const hasUrl = uploadMode === 'url' && data.external_url && data.external_url.trim() !== '';

    if (!hasFile && !hasUrl) {
      if (uploadMode === 'file') {
        toast.error('Please upload a file or switch to external URL mode');
      } else {
        toast.error('Please provide an external URL or switch to file upload mode');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: data.type,
        title: data.title || undefined,
        description: data.description || undefined,
        file: uploadMode === 'file' ? file || undefined : undefined,
        external_url: uploadMode === 'url' ? data.external_url || undefined : undefined,
        order: data.order || 0,
      });

      // Reset form and close dialog
      reset();
      setFile(null);
      setUploadMode('file');
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error submitting resource:', error);
      // Error toast is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // Prevent closing if submitting or initializing
    if (!newOpen && (isSubmitting || isInitializing)) {
      return; // Don't close if submitting or initializing
    }
    
    // If closing, reset form state first
    if (!newOpen) {
      reset();
      setFile(null);
      setUploadMode('file');
      setIsSubmitting(false);
      setIsInitializing(false);
    }
    
    // Always call onOpenChange to update parent state
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (isSubmitting || isInitializing) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (isSubmitting || isInitializing) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (isSubmitting || isInitializing) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
          <DialogDescription>
            {resource
              ? 'Update the resource details below.'
              : 'Add a new resource to this product. You can upload a file or provide an external URL.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent submission if already submitting
            if (isSubmitting) {
              return;
            }
            
            // Only submit if button is not disabled
            const hasFile = uploadMode === 'file' && file !== null;
            const hasUrl = uploadMode === 'url' && externalUrl && externalUrl.trim() !== '';
            
            if (!hasFile && !hasUrl) {
              if (uploadMode === 'file') {
                toast.error('Please upload a file or switch to external URL mode');
              } else {
                toast.error('Please provide an external URL or switch to file upload mode');
              }
              return;
            }
            
            handleSubmit(onFormSubmit)(e);
          }}
          className="space-y-4"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key if validation fails
            if (e.key === 'Enter') {
              const hasFile = uploadMode === 'file' && file !== null;
              const hasUrl = uploadMode === 'url' && externalUrl && externalUrl.trim() !== '';
              if (!hasFile && !hasUrl) {
                e.preventDefault();
                e.stopPropagation();
                if (uploadMode === 'file') {
                  toast.error('Please upload a file or switch to external URL mode');
                } else {
                  toast.error('Please provide an external URL or switch to file upload mode');
                }
              }
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="type">Resource Type *</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setIsInitializing(false); // Clear initializing flag on user interaction
                setValue('type', value as 'VIDEO' | 'DOCUMENT' | 'FILE');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="DOCUMENT">Document (PDF, DOCX, etc.)</SelectItem>
                <SelectItem value="FILE">File</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction Video"
                {...register('title')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                placeholder="0"
                {...register('order', { 
                  valueAsNumber: true,
                  onChange: () => setIsInitializing(false), // Clear initializing flag on user interaction
                })}
              />
              {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this resource"
              rows={3}
              {...register('description', {
                onChange: () => setIsInitializing(false), // Clear initializing flag on user interaction
              })}
            />
          </div>

          {/* File Upload or External URL */}
          <div className="space-y-2">
            <Label>Resource Content *</Label>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => {
                  setIsInitializing(false); // Clear initializing flag on user interaction
                  setUploadMode('file');
                  setValue('external_url', '');
                }}
                className="flex-1"
              >
                Upload File
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                onClick={() => {
                  setIsInitializing(false); // Clear initializing flag on user interaction
                  setUploadMode('url');
                  setFile(null);
                }}
                className="flex-1"
              >
                Use External URL
              </Button>
            </div>

            {/* File Upload */}
            {uploadMode === 'file' && (
              <FileUpload
                value={file ? URL.createObjectURL(file) : ''}
                onChange={(uploadedFile, url) => {
                  setIsInitializing(false); // Clear initializing flag on user interaction
                  if (uploadedFile) {
                    setFile(uploadedFile);
                  }
                }}
                onUrlChange={() => {}}
                label=""
                showUrlInput={false}
                accept="*/*"
                maxSize={100}
              />
            )}

            {/* External URL Input */}
            {uploadMode === 'url' && (
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={externalUrl || ''}
                  onChange={(e) => {
                    setIsInitializing(false); // Clear initializing flag on user interaction
                    setValue('external_url', e.target.value);
                  }}
                />
                {errors.external_url && (
                  <p className="text-sm text-destructive">{errors.external_url.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter a URL to an external resource (e.g., YouTube, Vimeo, Google Drive)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (uploadMode === 'file' && !file) ||
                (uploadMode === 'url' && (!externalUrl || externalUrl.trim() === ''))
              }
            >
              {isSubmitting ? 'Saving...' : resource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

