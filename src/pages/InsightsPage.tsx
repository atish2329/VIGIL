import { motion } from 'framer-motion';
import { SectionHeader, ThreatCard } from '../components';
import { Footer } from '../components';
import { ThreatInsight } from '../types';

const threatInsights: ThreatInsight[] = [
  {
    id: 'phishing',
    title: 'Phishing',
    description: 'Deceptive attempts to obtain sensitive information such as usernames, passwords, or credit card details by pretending to be a trustworthy entity. Phishing attacks often use email spoofing, instant messaging, or fake websites to trick victims.',
    icon: '🎣',
    category: 'phishing',
  },
  {
    id: 'impersonation',
    title: 'Impersonation',
    description: 'Attackers pretend to be someone you trust - a colleague, friend, family member, or a well-known organization - to manipulate you into revealing information or taking action. This psychological manipulation is a core tactic in social engineering.',
    icon: '👤',
    category: 'impersonation',
  },
  {
    id: 'credential-theft',
    title: 'Credential Theft',
    description: 'Malicious attempts to steal usernames, passwords, API keys, or other authentication credentials. Once obtained, attackers can gain unauthorized access to accounts, systems, or sensitive data.',
    icon: '🔑',
    category: 'credential-theft',
  },
  {
    id: 'urgency',
    title: 'Urgency & Scarcity',
    description: 'Scammers create a false sense of urgency or scarcity to pressure victims into acting quickly without thinking critically. Phrases like "Act now or lose access!" or "Limited time offer!" are common red flags.',
    icon: '⏰',
    category: 'urgency',
  },
  {
    id: 'fake-support',
    title: 'Fake Support Scams',
    description: 'Fraudsters pose as technical support representatives from legitimate companies. They contact victims claiming to help with computer issues, but their real goal is to gain remote access, install malware, or extract payment.',
    icon: '💼',
    category: 'fake-support',
  },
  {
    id: 'payment-scams',
    title: 'Payment Scams',
    description: 'Deceptive schemes that trick victims into making payments to fraudulent accounts. These include fake invoices, advance fee fraud, investment scams, and romance scams where payment is requested for various false pretenses.',
    icon: '💳',
    category: 'payment-scams',
  },
  {
    id: 'qr-code-scams',
    title: 'QR Code Scams',
    description: 'Malicious QR codes that, when scanned, can direct users to phishing websites, download malware, or initiate unwanted transactions. Attackers often place these codes in public places or send them via messaging apps.',
    icon: '📷',
    category: 'qr-scams',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Psychological manipulation techniques used to trick individuals into divulging confidential information or performing actions. This umbrella term includes phishing, pretexting, baiting, and tailgating.',
    icon: '🧠',
    category: 'social-engineering',
  },
];

const preventionTips = [
  {
    title: 'Verify Before You Trust',
    description: 'Always verify the identity of the person or organization contacting you through official channels.',
    icon: '✅',
  },
  {
    title: 'Don\'t Click Suspicious Links',
    description: 'Hover over links to see the actual URL before clicking. When in doubt, navigate to the website directly.',
    icon: '🔗',
  },
  {
    title: 'Enable Multi-Factor Authentication',
    description: 'Use MFA on all important accounts to add an extra layer of security beyond just passwords.',
    icon: '🔐',
  },
  {
    title: 'Keep Software Updated',
    description: 'Regularly update your operating system, browsers, and security software to protect against known vulnerabilities.',
    icon: '📦',
  },
  {
    title: 'Use Strong, Unique Passwords',
    description: 'Create complex passwords and use a different one for each account. Consider using a password manager.',
    icon: '🔑',
  },
  {
    title: 'Educate Yourself',
    description: 'Stay informed about common scams and tactics. Knowledge is your best defense against cyber threats.',
    icon: '📚',
  },
];

export const InsightsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <SectionHeader
            title="Know the patterns."
            eyebrow="THREAT INSIGHTS"
            description="Understand common cybersecurity threats and learn how to protect yourself"
          />
        </motion.div>

        {/* Threat Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold text-primary-text mb-6">
            Common Threats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threatInsights.map((insight, index) => (
              <ThreatCard key={insight.id} insight={insight} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Prevention Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="Stay Protected"
            subtitle="Prevention Tips"
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preventionTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-card-bg rounded-2xl border border-border-color p-6 h-full">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 bg-soft-accent rounded-xl flex items-center justify-center"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <span className="text-2xl">{tip.icon}</span>
                    </motion.div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-primary-text mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-secondary-text">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What Makes VIGIL Different */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <SectionHeader
            title="What Makes VIGIL Different"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              className="bg-soft-accent/30 rounded-2xl p-6"
            >
              <div className="w-14 h-14 mb-4 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Evidence-First Approach
              </h3>
              <p className="text-secondary-text">
                VIGIL doesn't just tell you something is suspicious - it shows you the evidence 
                and explains why it matters, putting you in control of the decision.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              className="bg-soft-accent/30 rounded-2xl p-6"
            >
              <div className="w-14 h-14 mb-4 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Multi-Signal Analysis
              </h3>
              <p className="text-secondary-text">
                We analyze content across multiple dimensions - text patterns, visual elements, 
                URLs, and contextual signals - to provide comprehensive threat detection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
              className="bg-soft-accent/30 rounded-2xl p-6"
            >
              <div className="w-14 h-14 mb-4 bg-primary-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                Privacy-Conscious
              </h3>
              <p className="text-secondary-text">
                Your data stays yours. VIGIL never collects or stores sensitive information 
                unnecessarily, and all analysis happens with your privacy in mind.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
          className="text-center py-12"
        >
          <h2 className="text-3xl font-bold text-primary-text mb-4">
            Ready to Stay Safe?
          </h2>
          <p className="text-xl text-secondary-text mb-8">
            Start using VIGIL to protect yourself from cyber threats
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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

import { Button } from '../components';

export default InsightsPage;
