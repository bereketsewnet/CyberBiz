import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { User } from '@/types';

const userSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYER', 'SEEKER', 'LEARNER']),
  subscription_tier: z.enum(['FREE', 'PRO_EMPLOYER']),
  credits: z.number().int().min(0),
});

type UserFormData = z.infer<typeof userSchema>;

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const role = watch('role');
  const subscriptionTier = watch('subscription_tier');

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await apiService.getAdminUser(id!);
      const userData = response.data;
      setUser(userData);
      setValue('full_name', userData.full_name);
      setValue('email', userData.email);
      setValue('phone', userData.phone || '');
      setValue('role', userData.role);
      setValue('subscription_tier', userData.subscription_tier);
      setValue('credits', userData.credits);
    } catch (error) {
      toast.error('User not found');
      navigate('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await apiService.updateAdminUser(id, {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        subscription_tier: data.subscription_tier,
        credits: data.credits,
      });
      toast.success('User updated successfully!');
      setIsEditMode(false);
      loadUser();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: 'destructive',
      EMPLOYER: 'default',
      SEEKER: 'secondary',
      LEARNER: 'outline',
    };
    return <Badge variant={variants[role] as any}>{role}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
          <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back to Users
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">User Details</h1>
                <p className="text-muted-foreground">View and manage user information</p>
              </div>
              {!isEditMode && (
                <Button onClick={() => setIsEditMode(true)} className="bg-primary">
                  Edit User
                </Button>
              )}
            </div>

            {isEditMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" {...register('full_name')} />
                    {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={role} onValueChange={(value) => setValue('role', value as UserFormData['role'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="EMPLOYER">Employer</SelectItem>
                          <SelectItem value="SEEKER">Seeker</SelectItem>
                          <SelectItem value="LEARNER">Learner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription_tier">Subscription Tier *</Label>
                      <Select value={subscriptionTier} onValueChange={(value) => setValue('subscription_tier', value as UserFormData['subscription_tier'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free</SelectItem>
                          <SelectItem value="PRO_EMPLOYER">Pro Employer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="0"
                      {...register('credits', { valueAsNumber: true })}
                    />
                    {errors.credits && <p className="text-sm text-destructive">{errors.credits.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:opacity-90" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">{user.full_name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {getRoleBadge(user.role)}
                      <Badge variant="outline">{user.subscription_tier}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">{user.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Credits: </span>
                    <span className="font-semibold text-foreground">{user.credits}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined: </span>
                    <span className="text-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

