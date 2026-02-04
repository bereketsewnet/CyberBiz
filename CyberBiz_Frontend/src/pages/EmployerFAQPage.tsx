import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { HelpCircle, Users, Briefcase, ChevronDown } from 'lucide-react';

export default function EmployerFAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <section className="py-16 md:py-20" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Employer FAQ</h1>
              </div>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Answers to common questions from organizations posting jobs and promoting opportunities on CyberBiz Africa.
              </p>
            </motion.div>

            <div className="space-y-4">
              {/* Q1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl overflow-hidden transition-colors"
                style={{ borderColor: 'rgb(226 232 240)' }}
              >
                <details className="group p-6 cursor-pointer bg-slate-50">
                  <summary className="flex items-center justify-between font-medium text-slate-900 list-none">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <span>How do I post a job on CyberBiz Africa?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-slate-600 mt-4 ml-9 text-sm leading-relaxed">
                    To post a job, first create an employer account by signing up as an Employer. Once logged in, you can
                    navigate to the employer dashboard and use the &quot;Post a Job&quot; option to enter job details and publish your listing.
                  </p>
                </details>
              </motion.div>

              {/* Q2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl overflow-hidden transition-colors"
                style={{ borderColor: 'rgb(226 232 240)' }}
              >
                <details className="group p-6 cursor-pointer bg-slate-50">
                  <summary className="flex items-center justify-between font-medium text-slate-900 list-none">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span>Can I promote my organization or services in addition to job posts?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-slate-600 mt-4 ml-9 text-sm leading-relaxed">
                    Yes. In addition to job listings, CyberBiz Africa offers options for business promotion and sponsorship posts.
                    Contact us via the Contact page if you would like to run a branded campaign or highlight your organization&apos;s work.
                  </p>
                </details>
              </motion.div>

              {/* Q3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl overflow-hidden transition-colors"
                style={{ borderColor: 'rgb(226 232 240)' }}
              >
                <details className="group p-6 cursor-pointer bg-slate-50">
                  <summary className="flex items-center justify-between font-medium text-slate-900 list-none">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <span>How are applications delivered to me?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-slate-600 mt-4 ml-9 text-sm leading-relaxed">
                    Candidates apply through the platform and their applications are visible from your employer dashboard.
                    You can review CVs, cover letters, and manage applications from one place.
                  </p>
                </details>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


