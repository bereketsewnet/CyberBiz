import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { CheckCircle2, Briefcase, Star } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pricing Plans
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Flexible options for employers of all sizes. Start with free posting or upgrade for more visibility and support.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Starter</h2>
                  <p className="text-xs text-slate-500">Good for testing the platform</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">Free</p>
              <p className="text-sm text-slate-500 mb-4">Basic job posting with standard visibility.</p>
              <ul className="space-y-2 text-sm text-slate-700 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1 active job post
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Standard listing placement
                </li>
              </ul>
              <p className="text-xs text-slate-400">
                Ideal for small organizations just getting started.
              </p>
            </motion.div>

            {/* Standard Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-blue-500 via-emerald-400 to-orange-400" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Professional</h2>
                    <p className="text-xs text-slate-300">Recommended for most employers</p>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-2">Custom</p>
                <p className="text-sm text-slate-200 mb-4">
                  Enhanced visibility and support tailored to your needs.
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Multiple active job posts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Highlighted listings and featured placement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Priority support from our team
                  </li>
                </ul>
                <p className="text-xs text-slate-300">
                  Contact us via the Contact page for a tailored quote based on your volume and needs.
                </p>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Enterprise</h2>
                  <p className="text-xs text-slate-500">Large organizations & long-term hiring</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">Custom</p>
              <p className="text-sm text-slate-500 mb-4">
                Dedicated solutions for high-volume recruitment and branding.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Unlimited postings under a custom agreement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Custom campaigns and sponsorship options
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Dedicated account support
                </li>
              </ul>
              <p className="text-xs text-slate-400">
                Talk to us to design a package that fits your organization.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


