import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResourceItem } from './ResourceItem';
import { ResourceForm } from './ResourceForm';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { ProductResource } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductResourcesManagerProps {
  productId: string;
}

export function ProductResourcesManager({ productId }: ProductResourcesManagerProps) {
  const [resources, setResources] = useState<ProductResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ProductResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<ProductResource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [productId]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProductResources(productId);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = () => {
    setEditingResource(null);
    setIsFormOpen(true);
  };

  const handleEditResource = (resource: ProductResource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleDeleteResource = (resource: ProductResource) => {
    setDeletingResource(resource);
  };

  const confirmDelete = async () => {
    if (!deletingResource || !productId) return;

    try {
      await apiService.deleteProductResource(productId, deletingResource.id);
      toast.success('Resource deleted successfully');
      setResources(resources.filter((r) => r.id !== deletingResource.id));
      setDeletingResource(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleFormSubmit = async (data: {
    type: 'VIDEO' | 'DOCUMENT' | 'FILE';
    title?: string;
    description?: string;
    file?: File;
    external_url?: string;
    order?: number;
  }) => {
    if (!productId) {
      toast.error('Product ID is required');
      throw new Error('Product ID is required');
    }

    // Validate that either file or external_url is provided
    if (!data.file && (!data.external_url || data.external_url.trim() === '')) {
      toast.error('Please provide either a file or an external URL');
      throw new Error('File or URL is required');
    }

    try {
      const formData = new FormData();
      formData.append('type', data.type);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.file) {
        formData.append('file', data.file);
      } else if (data.external_url && data.external_url.trim() !== '') {
        formData.append('external_url', data.external_url.trim());
      }
      if (data.order !== undefined) {
        formData.append('order', data.order.toString());
      }

      if (editingResource) {
        // Update existing resource
        await apiService.updateProductResource(productId, editingResource.id, formData);
        toast.success('Resource updated successfully');
      } else {
        // Create new resource
        await apiService.createProductResource(productId, formData);
        toast.success('Resource added successfully');
      }

      // Refresh resources list
      await fetchResources();
      setIsFormOpen(false);
      setEditingResource(null);
    } catch (error: any) {
      console.error('Error saving resource:', error);
      const errorMessage = error?.message || (editingResource ? 'Failed to update resource' : 'Failed to add resource');
      toast.error(errorMessage);
      throw error; // Re-throw so form can handle it
    }
  };

  const handleReorder = async (newOrder: string[]) => {
    try {
      await apiService.reorderProductResources(productId, newOrder);
      toast.success('Resources reordered successfully');
      await fetchResources();
    } catch (error) {
      console.error('Error reordering resources:', error);
      toast.error('Failed to reorder resources');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resources</h3>
          <p className="text-sm text-muted-foreground">
            Manage videos, documents, and files for this product
          </p>
        </div>
        <Button type="button" onClick={handleAddResource} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No resources added yet</p>
          <Button type="button" onClick={handleAddResource} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              onEdit={() => handleEditResource(resource)}
              onDelete={() => handleDeleteResource(resource)}
            />
          ))}
        </div>
      )}

      <ResourceForm
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open && isFormOpen) {
            setEditingResource(null);
          }
          setIsFormOpen(open);
        }}
        onSubmit={handleFormSubmit}
        resource={editingResource}
        defaultOrder={resources.length}
      />

      <AlertDialog
        open={!!deletingResource}
        onOpenChange={(open) => {
          if (!open) setDeletingResource(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

