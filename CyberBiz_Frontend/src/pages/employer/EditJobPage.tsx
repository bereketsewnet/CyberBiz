import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { JobPosting } from '@/types';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  job_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
  description_html: z.string().min(50, 'Description must be at least 50 characters'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  expires_at: z.string().optional(),
  company_description: z.string().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type JobFormData = z.infer<typeof jobSchema>;


export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const status = watch('status');
  const jobType = watch('job_type');
  const experience = watch('experience');

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await apiService.getJob(id!);
      const jobData = response.data;
      setJob(jobData);
      setValue('title', jobData.title);
      setValue('job_type', jobData.job_type);
      setValue('location', jobData.location || '');
      setValue('experience', jobData.experience || '');
      setValue('status', jobData.status);
      setValue('company_description', jobData.company_description || '');
      setValue('description_html', jobData.description_html || '');
      setValue('website_url', jobData.employer?.website_url || '');
      if (jobData.expires_at) {
        // Handle both ISO format (2025-12-27T00:00:00) and datetime format (2025-12-27 00:00:00)
        const dateStr = jobData.expires_at.includes('T') 
          ? jobData.expires_at.split('T')[0]
          : jobData.expires_at.split(' ')[0];
        setValue('expires_at', dateStr);
      }
      // Set skills
      if (jobData.skills && jobData.skills.length > 0) {
        setSkills(jobData.skills);
        setValue('skills', jobData.skills);
      }
    } catch (error) {
      toast.error('Job not found');
      // Navigate based on current path
      if (window.location.pathname.includes('/admin/jobs')) {
        navigate('/admin/jobs');
      } else {
        navigate('/my-jobs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills);
  };

  const onSubmit = async (data: JobFormData) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await apiService.updateJob(id, {
        title: data.title,
        job_type: data.job_type,
        location: data.location,
        experience: data.experience,
        skills: skills.length > 0 ? skills : undefined,
        description_html: data.description_html, // HTML from rich text editor
        status: data.status,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : undefined,
        company_description: data.company_description,
        website_url: data.website_url || undefined,
      });
      toast.success('Job updated successfully!');
      // Navigate based on current path
      if (window.location.pathname.includes('/admin/jobs')) {
        navigate('/admin/jobs');
      } else {
        navigate('/my-jobs');
      }
    } catch (error) {
      toast.error('Failed to update job');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to={window.location.pathname.includes('/admin/jobs') ? '/admin/jobs' : '/my-jobs'}
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Edit Job Posting
            </h1>
            <p className="text-muted-foreground mb-8">
              Update your job posting details
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select 
                      value={jobType} 
                      onValueChange={(value) => setValue('job_type', value as JobFormData['job_type'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-time</SelectItem>
                        <SelectItem value="PART_TIME">Part-time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Addis Ababa, Ethiopia" {...register('location')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={experience || undefined} onValueChange={(value) => setValue('experience', value)}>
                      <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Mid">Mid Level</SelectItem>
                        <SelectItem value="Senior">Senior Level</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="e.g. React, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_html">Job Description *</Label>
                  <RichTextEditor
                    value={watch('description_html') || ''}
                    onChange={(value) => setValue('description_html', value, { shouldValidate: true })}
                    placeholder="Enter job description with formatting..."
                    error={errors.description_html?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Company Website URL</Label>
                  <Input 
                    id="website_url" 
                    type="url" 
                    placeholder="https://example.com" 
                    {...register('website_url')} 
                  />
                  {errors.website_url && <p className="text-sm text-destructive">{errors.website_url.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description">About the Company</Label>
                  <Textarea
                    id="company_description"
                    placeholder="Describe your company..."
                    rows={4}
                    {...register('company_description')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select 
                      value={status} 
                      onValueChange={(value) => setValue('status', value as JobFormData['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Expiry Date</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('expires_at')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(window.location.pathname.includes('/admin/jobs') ? '/admin/jobs' : '/my-jobs')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gold-gradient hover:opacity-90 shadow-gold flex-1"
                  disabled={isSaving}
                >
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
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
