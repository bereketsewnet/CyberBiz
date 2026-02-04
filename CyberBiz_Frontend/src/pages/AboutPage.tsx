import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { Users, Target, Globe, Award, Briefcase, BookOpen, FileText, HelpCircle, ChevronDown, ShieldCheck, DollarSign, School, ArrowRight } from 'lucide-react';
import { apiService } from '@/services/apiService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const values = [
  {
    icon: Users,
    title: 'Accountability',
    description: 'We take responsibility for our actions and commitments, ensuring transparency in everything we do.',
  },
  {
    icon: Target,
    title: 'Integrity',
    description: 'We operate with honesty and ethical principles, building trust with our community.',
  },
  {
    icon: Globe,
    title: 'Respect',
    description: 'We value and honor the dignity of every individual and organization we work with.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in delivering quality services and achieving outstanding results.',
  },
];

const services = [
  {
    icon: Briefcase,
    title: 'Online Job Advertisement and Business Promotion Services',
    description: 'An online Job Advertisement and business promotion services focusing on jobs and businesses emanating from local and international nonprofit organizations including the Civil Society Sector, Bilateral and Multilateral Aid Organizations and Other Development Partners.',
  },
  {
    icon: BookOpen,
    title: 'Virtual Coaching and Training Services',
    description: 'A virtual coaching and training services on program cycle management and leadership tailored to individuals wanting to develop and advance their career in the NGO sector.',
  },
  {
    icon: FileText,
    title: 'Career Advancement Blogs',
    description: 'A career advancement blogs and a tailored virtual career coaching services to prepare young people for higher education and to help build capacity of fresh graduates and young aspiring professionals within the nonprofit sector to develop and take their career to the next level.',
  },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<{
    faq_q1?: string;
    faq_a1?: string;
    faq_q2?: string;
    faq_a2?: string;
    faq_q3?: string;
    faq_a3?: string;
    privacy_policy?: string;
  }>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiService.getPublicSiteSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching site settings for About page:', error);
      }
    };
    fetchSettings();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20" style={{ backgroundColor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                WHO WE ARE
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Cyberbizafrica.com is founded by a veteran professional with over 30 years of executive-level career in management and leadership of high-performing teams and programs within the NGO sector at international levels. Cyberbizafrica consists of a team of professionals with years of tested results-based experience in jobs and business promotion as well as in providing training and coaching services on program management and leadership skills.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  OUR VISION
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  To be among the top organization for digital jobs and business promotion and for training and coaching in program management and leadership skills.
                  </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  OUR MISSION
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  To help build the capacity of young and upcoming professionals in their quest for career advancement while connecting them with an available job and business opportunities and providing on the job training and coaching services for aspiring managers and with a focus on the nonprofit sector.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20" style={{ backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our Values
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const iconColors = [
                  { bg: 'bg-blue-50', text: 'text-blue-600', darkBg: 'dark:bg-blue-950/30', darkText: 'dark:text-blue-400' },
                  { bg: 'bg-orange-50', text: 'text-orange-600', darkBg: 'dark:bg-orange-950/30', darkText: 'dark:text-orange-400' },
                  { bg: 'bg-purple-50', text: 'text-purple-600', darkBg: 'dark:bg-purple-950/30', darkText: 'dark:text-purple-400' },
                  { bg: 'bg-green-50', text: 'text-green-600', darkBg: 'dark:bg-green-950/30', darkText: 'dark:text-green-400' },
                ];
                const colors = iconColors[index % iconColors.length];
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 text-center group hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.darkBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <value.icon className={`w-6 h-6 ${colors.text} ${colors.darkText}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                WHAT WE DO
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                We offer unmatched services in the following areas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const serviceIconColors = [
                  { bg: 'bg-blue-900/30', text: 'text-blue-400' },
                  { bg: 'bg-orange-900/30', text: 'text-orange-400' },
                  { bg: 'bg-purple-900/30', text: 'text-purple-400' },
                ];
                const iconColors = serviceIconColors[index % serviceIconColors.length];
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl ${iconColors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className={`w-7 h-7 ${iconColors.text}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {index + 1}. {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section (shared with Home page content) */}
        <section className="py-20" style={{ backgroundColor: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-3xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Get answers to common questions about our platform
              </p>
            </motion.div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        {settings.faq_q1 || 'How can I access content of the site?'}
                      </span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {settings.faq_a1 ||
                      'You can browse jobs and courses for free. Some premium content may require registration or purchase.'}
                  </p>
                </details>
              </div>

              {/* Question 2 */}
              <div
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <DollarSign className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        {settings.faq_q2 || 'Is the job board free to access?'}
                      </span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {settings.faq_a2 ||
                      'Yes, browsing and searching for jobs is completely free. You can view job listings and apply without any cost.'}
                  </p>
                </details>
              </div>

              {/* Question 3 */}
              <div
                className="border rounded-xl overflow-hidden transition-colors"
                style={{
                  borderColor: 'rgb(51 65 85)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <details className="group p-6 cursor-pointer" style={{ backgroundColor: '#1E293B' }}>
                  <summary className="flex items-center justify-between font-medium text-white list-none">
                    <div className="flex items-center gap-3">
                      <School className="text-secondary" style={{ color: '#2563EB' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        {settings.faq_q3 || 'How can I access the cybercoach service?'}
                      </span>
                    </div>
                    <ChevronDown className="transition-transform group-open:rotate-180 text-slate-400" />
                  </summary>
                  <p className="text-slate-400 mt-4 ml-9 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {settings.faq_a3 ||
                      'Our virtual coaching services on program lifecycle management and leadership skills are available through our courses section. Browse our catalog to find relevant training programs.'}
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Privacy Policy
                </h2>
              </div>
              {settings.privacy_policy ? (
                <>
                  <p
                    className="text-slate-700 leading-relaxed whitespace-pre-line line-clamp-6"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {settings.privacy_policy}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-base font-semibold text-primary hover:text-accent transition-colors"
                      onClick={() => setPrivacyOpen(true)}
                    >
                      <span>See more</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  The privacy policy will be published here once it is configured in the admin settings.
                </p>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Full Privacy Policy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          {settings.privacy_policy ? (
            <p
              className="mt-2 text-slate-700 leading-relaxed whitespace-pre-line"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {settings.privacy_policy}
            </p>
          ) : (
            <p className="mt-2 text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              The privacy policy will be published here once it is configured in the admin settings.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
