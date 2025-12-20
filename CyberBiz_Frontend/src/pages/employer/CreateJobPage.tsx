import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header, Footer } from '@/components/layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  job_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
  description_html: z.string().min(50, 'Description must be at least 50 characters'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  expires_at: z.string().optional(),
  company_description: z.string().optional(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: 'DRAFT', job_type: 'FULL_TIME' },
  });

  const status = watch('status');
  const jobType = watch('job_type');

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
    setIsLoading(true);
    try {
      await apiService.createJob({
        title: data.title,
        job_type: data.job_type,
        location: data.location,
        experience: data.experience,
        skills: skills.length > 0 ? skills : undefined,
        description_html: data.description_html, // HTML from rich text editor
        website_url: data.website_url || undefined,
        status: data.status,
        expires_at: data.expires_at,
        company_description: data.company_description,
      });
      toast.success('Job created successfully!');
      // Navigate based on current path
      if (window.location.pathname.includes('/admin/jobs')) {
        navigate('/admin/jobs');
      } else {
        navigate('/my-jobs');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Job Posting</h1>
            <p className="text-muted-foreground mb-8">Fill in the details below to create a new job listing</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" placeholder="e.g. Senior Software Engineer" {...register('title')} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select value={jobType} onValueChange={(value) => setValue('job_type', value as JobFormData['job_type'])}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                    <Label htmlFor="experience">Experience</Label>
                    <Input id="experience" placeholder="e.g. 3-5 years" {...register('experience')} />
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
                    placeholder="Describe your company, its mission, culture, and what makes it a great place to work..."
                    rows={4}
                    {...register('company_description')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value) => setValue('status', value as 'DRAFT' | 'PUBLISHED')}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Application Deadline</Label>
                    <Input id="expires_at" type="date" {...register('expires_at')} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" className="bg-gold-gradient hover:opacity-90" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Job'}
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
