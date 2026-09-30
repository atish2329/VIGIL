import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './Button';

const footerLinks = [
  { label: 'Home', path: '/' },
  { label: 'Scanner', path: '/scanner' },
  { label: 'VIGIL Vision', path: '/vision' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Threat Insights', path: '/insights' },
  { label: 'About', path: '/about' },
];

const legalLinks = [
  { label: 'Privacy', path: '/privacy' },
  { label: 'Terms', path: '/terms' },
  { label: 'Security', path: '/security' },
];

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-background border-t border-border-color/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text">VIGIL</h3>
                <p className="text-sm text-secondary-text">See the threat before you click</p>
              </div>
            </div>
            <p className="text-sm text-secondary-text/60">
              AI-powered cybersecurity platform for identifying phishing, scams, 
              and suspicious content before you interact with them.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-primary-text mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + footerLinks.indexOf(link) * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className="text-secondary-text hover:text-primary-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-primary-text mb-4">Resources</h4>
            <ul className="space-y-2">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + 0 * 0.05 }}
              >
                <a
                  href="https://github.com/atish2329/VIGIL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 flex items-center gap-2"
                >
                  <span>GitHub</span>
                  <span className="text-xs">↗</span>
                </a>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + 1 * 0.05 }}
              >
                <a
                  href="#"
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 flex items-center gap-2"
                >
                  <span>Documentation</span>
                  <span className="text-xs">↗</span>
                </a>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + 2 * 0.05 }}
              >
                <a
                  href="#"
                  className="text-secondary-text hover:text-primary-text transition-colors duration-200 flex items-center gap-2"
                >
                  <span>API Reference</span>
                  <span className="text-xs">↗</span>
                </a>
              </motion.li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-primary-text mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className="text-secondary-text hover:text-primary-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border-color/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-secondary-text/60">
            © {new Date().getFullYear()} VIGIL. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <p className="text-sm text-secondary-text/60">
              Made with ❤️ for cybersecurity
            </p>
            <Button variant="ghost" size="sm" leftIcon="🌐">
              English
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
