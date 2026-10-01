import { motion } from 'framer-motion';
import { SectionHeader } from '../components';
import { Footer } from '../components';
import { Card } from '../components';
import { Button } from '../components';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <SectionHeader
            title="About VIGIL"
            eyebrow="OUR STORY"
            description="Building a safer digital world, one scan at a time"
          />
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <Card variant="elevated" padding="lg" className="shadow-soft">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary-text mb-4">
                  Our Mission
                </h2>
                <p className="text-secondary-text leading-relaxed mb-6">
                  At VIGIL, we believe that everyone deserves to feel safe and secure online. 
                  In a world where cyber threats are becoming increasingly sophisticated and 
                  prevalent, our mission is to empower individuals and organizations with the 
                  tools they need to identify and avoid potential security risks.
                </p>
                <p className="text-secondary-text leading-relaxed">
                  We're committed to making cybersecurity accessible, understandable, and 
                  actionable for everyone. Whether you're a seasoned professional or just 
                  starting your digital journey, VIGIL is here to help you stay one step 
                  ahead of the threats.
                </p>
              </div>
              <div className="flex-shrink-0 w-32 h-32 bg-soft-accent rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🛡️</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="What We Do"
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="bordered" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2">
                    Threat Detection
                  </h3>
                  <p className="text-secondary-text">
                    VIGIL analyzes messages, URLs, and screenshots to identify potential 
                    security threats including phishing, scams, credential harvesting, 
                    and social engineering attempts.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2">
                    Evidence-Based Analysis
                  </h3>
                  <p className="text-secondary-text">
                    We don't just flag suspicious content - we show you exactly what 
                    triggered our alerts and explain why it matters, so you can make 
                    informed decisions.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2">
                    Risk Scoring
                  </h3>
                  <p className="text-secondary-text">
                    Our sophisticated scoring system evaluates multiple factors to provide 
                    a clear assessment of risk levels, helping you prioritize what needs 
                    immediate attention.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2">
                    Actionable Insights
                  </h3>
                  <p className="text-secondary-text">
                    Every analysis comes with practical recommendations tailored to the 
                    specific threats detected, so you know exactly what to do next.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="Our Technology"
            align="left"
          />

          <Card variant="subtle" padding="lg">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-primary-text mb-3">
                  Multi-Signal Analysis
                </h3>
                <p className="text-secondary-text leading-relaxed">
                  VIGIL goes beyond simple pattern matching. We analyze content across 
                  multiple dimensions:
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Text patterns and linguistic analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">URL structure and domain analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Visual element detection (for screenshots)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Contextual signal correlation</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-primary-text mb-3">
                  VIGIL Vision
                </h3>
                <p className="text-secondary-text leading-relaxed">
                  Our advanced screenshot analysis capability uses OCR (Optical Character 
                  Recognition) to extract text from images, then applies the same 
                  multi-signal analysis to identify threats. This allows you to analyze 
                  suspicious messages, webpages, or any content you've captured as an 
                  image.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold text-primary-text mb-3">
                  Privacy by Design
                </h3>
                <p className="text-secondary-text leading-relaxed">
                  We understand that trust is earned. That's why VIGIL is designed with 
                  privacy at its core:
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">No unnecessary data collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Local-first processing where possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Transparent data handling practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span className="text-secondary-text">Never storing sensitive content</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Why VIGIL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="Why VIGIL?"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              className="text-center p-6 bg-soft-accent/30 rounded-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-accent/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Fast & Accurate
              </h3>
              <p className="text-secondary-text">
                Get results in seconds with our optimized analysis engine that 
                balances speed with accuracy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
              className="text-center p-6 bg-soft-accent/30 rounded-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-accent/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Evidence-First
              </h3>
              <p className="text-secondary-text">
                We show you the evidence, not just the verdict. Understand why 
                something was flagged and make your own informed decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              className="text-center p-6 bg-soft-accent/30 rounded-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-accent/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Professional Grade
              </h3>
              <p className="text-secondary-text">
                Built with the same technology used by security professionals, but 
                designed to be accessible to everyone.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="The Team"
            align="center"
          />

          <Card variant="elevated" padding="lg" className="shadow-soft text-center">
            <div className="flex flex-col items-center">
              <motion.div
                className="w-24 h-24 mb-4 bg-soft-accent rounded-full flex items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="text-4xl">👤</span>
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl font-semibold text-primary-text mb-2"
              >
                Built by Security Enthusiasts
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-secondary-text max-w-2xl"
              >
                VIGIL was created by a team of cybersecurity professionals and software 
                engineers who are passionate about making the digital world safer for 
                everyone. We combine years of security experience with modern AI 
                technology to create tools that are both powerful and accessible.
              </motion.p>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
          className="text-center py-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl font-bold text-primary-text mb-4"
          >
            Ready to Experience VIGIL?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-secondary-text mb-8"
          >
            Start your first scan and see how VIGIL can help you stay safe online.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button variant="primary" size="lg" onClick={() => window.location.href = '/scanner'}>
              Start Scanning
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
