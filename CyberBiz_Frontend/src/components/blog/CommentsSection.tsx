import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { CommentItem } from './CommentItem';
import type { BlogComment } from '@/types';

interface CommentsSectionProps {
  blogId: string;
}

export function CommentsSection({ blogId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getBlogComments(blogId);
      setComments(response.data);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      // Don't show error toast - comments are optional and might fail for draft blogs
      // Just set empty comments array
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createBlogComment(blogId, {
        content: commentContent,
      });
      toast.success('Comment added successfully');
      setCommentContent('');
      fetchComments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 border-t border-slate-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  rows={4}
                  className="mb-3 border-slate-300"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !commentContent.trim()}
                  className="bg-primary hover:bg-accent"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-lg p-6 text-center mb-8">
              <p className="text-slate-600 mb-4">Please login to leave a comment</p>
              <Button asChild className="bg-primary hover:bg-accent">
                <a href="/login">Login</a>
              </Button>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-4 h-32 animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  blogId={blogId}
                  onUpdate={fetchComments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

