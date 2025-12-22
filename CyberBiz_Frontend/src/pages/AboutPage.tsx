import { motion } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { Users, Target, Globe, Award, Briefcase, BookOpen, FileText } from 'lucide-react';

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
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero-gradient py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-secondary-foreground mb-6">
                WHO WE ARE
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Cyberbizafrica.com is founded by a veteran professional with over 30 years of executive-level career in management and leadership of high-performing teams and programs within the NGO sector at international levels. Cyberbizafrica consists of a team of professionals with years of tested results-based experience in jobs and business promotion as well as in providing training and coaching services on program management and leadership skills.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  OUR VISION
                </h2>
                <p className="text-lg text-muted-foreground">
                  To be among the top organization for digital jobs and business promotion and for training and coaching in program management and leadership skills.
                  </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  OUR MISSION
                </h2>
                <p className="text-lg text-muted-foreground">
                  To help build the capacity of young and upcoming professionals in their quest for career advancement while connecting them with an available job and business opportunities and providing on the job training and coaching services for aspiring managers and with a focus on the nonprofit sector.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                WHAT WE DO
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We offer unmatched services in the following areas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-3 text-lg">
                    {index + 1}. {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
