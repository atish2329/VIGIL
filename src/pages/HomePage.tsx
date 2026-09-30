import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';
import { SectionHeader } from '../components';
import { Card } from '../components';
import { HowItWorks } from '../components';
import { ThreatCard } from '../components';
import { Footer } from '../components';
import { AnalysisMode } from '../types';

// Threat insights data
const threatInsights = [
  {
    id: 'phishing',
    title: 'Phishing',
    description: 'Deceptive attempts to obtain sensitive information by pretending to be a trustworthy entity.',
    icon: '🎣',
    category: 'phishing',
  },
  {
    id: 'impersonation',
    title: 'Impersonation',
    description: 'Attackers pretend to be someone you trust to trick you into revealing information or taking action.',
    icon: '👤',
    category: 'impersonation',
  },
  {
    id: 'credential-theft',
    title: 'Credential Theft',
    description: 'Malicious attempts to steal usernames, passwords, or other authentication credentials.',
    icon: '🔑',
    category: 'credential-theft',
  },
  {
    id: 'urgency',
    title: 'Urgency',
    description: 'Scammers create a sense of urgency to pressure victims into acting without thinking critically.',
    icon: '⏰',
    category: 'urgency',
  },
  {
    id: 'fake-support',
    title: 'Fake Support',
    description: 'Fraudsters pose as technical support to gain access to systems or extract payment.',
    icon: '💼',
    category: 'fake-support',
  },
  {
    id: 'payment-scams',
    title: 'Payment Scams',
    description: 'Deceptive schemes that trick victims into making payments to fraudulent accounts.',
    icon: '💳',
    category: 'payment-scams',
  },
];

// Feature cards for trust section
const features = [
  {
    id: 'multi-signal',
    title: 'Multi-signal Detection',
    description: 'Analyzes content across multiple dimensions to identify potential threats.',
    icon: '🎯',
  },
  {
    id: 'explainable',
    title: 'Explainable Results',
    description: 'Every finding comes with clear evidence and explanations you can understand.',
    icon: '💡',
  },
  {
    id: 'fast',
    title: 'Fast Analysis',
    description: 'Get results in seconds, not minutes, so you can make informed decisions quickly.',
    icon: '⚡',
  },
  {
    id: 'privacy',
    title: 'Privacy-conscious',
    description: 'Your data stays yours. We never collect or store sensitive information unnecessarily.',
    icon: '🔒',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null);

  const handleGetStarted = useCallback(() => {
    navigate('/scanner');
  }, [navigate]);

  const handleQuickScan = useCallback((mode: AnalysisMode) => {
    setSelectedMode(mode);
    setTimeout(() => {
      navigate(`/scanner?mode=${mode}`);
    }, 100);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-24 pb-16 sm:pt-32 sm:pb-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium text-primary-accent tracking-wider uppercase mb-4"
              >
                PREMIUM CYBERSECURITY
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-text leading-tight tracking-tight mb-6"
              >
                Stay one step<br />
                ahead of the threat.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                className="text-xl text-secondary-text mb-8 max-w-lg"
              >
                VIGIL helps you understand suspicious messages, URLs, 
                screenshots and webpages before you interact with them.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGetStarted}
                  rightIcon="→"
                >
                  Scan Something
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/about')}
                >
                  Explore VIGIL
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <SecurityIllustration />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Introduction Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16 sm:py-24 bg-soft-accent/30"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            title="Security should be easy to understand."
            description="VIGIL analyzes suspicious content using multiple security signals and explains what it finds, why it matters, and what you should do next."
          />
        </div>
      </motion.section>

      {/* Trust Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16 sm:py-24"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Why trust VIGIL?"
            eyebrow="CAPABILITIES"
            align="center"
          />

          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card variant="bordered" padding="lg" className="h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <motion.div
                      className="w-14 h-14 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <span className="text-3xl">{feature.icon}</span>
                    </motion.div>
                    
                    <motion.h3
                      className="text-lg font-semibold text-primary-text mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p
                      className="text-sm text-secondary-text flex-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16 sm:py-24 bg-background"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Start a quick scan"
            description="Choose what you want to analyze"
            align="center"
          />

          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleQuickScan('message')}
                leftIcon="💬"
                className="w-full sm:w-auto"
              >
                Scan Message
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleQuickScan('url')}
                leftIcon="🔗"
                className="w-full sm:w-auto"
              >
                Scan URL
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleQuickScan('screenshot')}
                leftIcon="📷"
                className="w-full sm:w-auto"
              >
                Scan Screenshot
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <HowItWorks />

      {/* Threat Insights */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16 sm:py-24 bg-soft-accent/20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Know the patterns."
            eyebrow="THREAT INSIGHTS"
            description="Understand common cybersecurity threats and how to recognize them"
            align="center"
          />

          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {threatInsights.map((insight, index) => (
              <ThreatCard key={insight.id} insight={insight} index={index} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16 sm:py-24"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl font-bold text-primary-text mb-6"
          >
            Ready to see the threat
            <br />
            before you click?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            className="text-xl text-secondary-text mb-8 max-w-2xl mx-auto"
          >
            Join thousands who use VIGIL to stay safe online. 
            Start your first analysis today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              rightIcon="→"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Security Illustration Component
const SecurityIllustration = () => {
  return (
    <div className="relative w-full h-96">
      {/* Abstract security-themed illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Shield */}
        <motion.div
          className="absolute w-48 h-48 bg-primary-accent/10 rounded-[40px] border-2 border-primary-accent/20"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-4 bg-primary-accent/5 rounded-[30px]"
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-8 flex items-center justify-center">
            <span className="text-4xl">🛡️</span>
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-12 left-8 w-12 h-12 bg-soft-accent rounded-full flex items-center justify-center"
          animate={{ y: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-lg">🔒</span>
        </motion.div>

        <motion.div
          className="absolute top-24 right-12 w-10 h-10 bg-soft-accent rounded-full flex items-center justify-center"
          animate={{ y: [5, -5, 5], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="text-lg">👁️</span>
        </motion.div>

        <motion.div
          className="absolute bottom-16 left-16 w-14 h-14 bg-soft-accent rounded-full flex items-center justify-center"
          animate={{ y: [-3, 3, -3], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <span className="text-lg">✅</span>
        </motion.div>

        <motion.div
          className="absolute bottom-24 right-8 w-11 h-11 bg-soft-accent rounded-full flex items-center justify-center"
          animate={{ y: [4, -4, 4], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <span className="text-lg">⚡</span>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <motion.path
          d="M 50 100 C 100 50, 150 50, 200 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.path
          d="M 200 100 C 250 150, 300 150, 350 100"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        <motion.path
          d="M 350 100 C 300 200, 250 200, 200 300"
          stroke="url(#gradient3)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.1 }}
        />
        <motion.path
          d="M 200 300 C 150 200, 100 200, 50 100"
          stroke="url(#gradient4)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.4 }}
        />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6C63A8', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#6C63A8', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ECE8F5', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#ECE8F5', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6C63A8', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#6C63A8', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ECE8F5', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#ECE8F5', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default HomePage;
