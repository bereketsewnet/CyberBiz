import { useState } from 'react';
import { MessageSquare, Reply, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { BlogComment } from '@/types';

interface CommentItemProps {
  comment: BlogComment;
  blogId: string;
  onUpdate: () => void;
  depth?: number;
}

export function CommentItem({ comment, blogId, onUpdate, depth = 0 }: CommentItemProps) {
  const { user } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.user.id;
  const canReply = comment.can_reply && user;

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createBlogComment(blogId, {
        content: replyContent,
        parent_id: comment.id,
      });
      toast.success('Reply added successfully');
      setReplyContent('');
      setIsReplying(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.updateBlogComment(comment.id.toString(), {
        content: editContent,
      });
      toast.success('Comment updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await apiService.deleteBlogComment(comment.id.toString());
      toast.success('Comment deleted successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-slate-200 pl-4' : ''}`}>
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900">{comment.user.full_name}</span>
              <span className="text-xs text-slate-500">
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="border-slate-300"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-accent"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 mt-3">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="text-slate-600 hover:text-primary"
              >
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-slate-600 hover:text-primary"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="mb-2 border-slate-300"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isSubmitting}
                className="bg-primary hover:bg-accent"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="border-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              blogId={blogId}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

