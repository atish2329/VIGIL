import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

const navItems = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'scanner', label: 'Scanner', path: '/scanner' },
  { id: 'vision', label: 'VIGIL Vision', path: '/vision' },
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'insights', label: 'Threat Insights', path: '/insights' },
];

const rightNavItems = [
  { id: 'about', label: 'About', path: '/about' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleGetStarted = () => {
    navigate('/scanner');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-sm shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary-accent rounded-lg flex items-center justify-center group-hover:shadow-soft transition-shadow">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary-text tracking-tight">
                  VIGIL
                </span>
                <span className="text-xs text-secondary-text -mt-1 hidden sm:block">
                  See the threat before you click
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary-accent'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {rightNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="text-sm font-medium text-secondary-text hover:text-primary-text transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="primary"
              size="sm"
              onClick={handleGetStarted}
              className="ml-2"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-primary-text hover:bg-soft-accent hover:text-primary-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent/20"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="lg:hidden bg-background/98 backdrop-blur-sm"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-soft-accent text-primary-accent'
                      : 'text-secondary-text hover:bg-soft-accent/50 hover:text-primary-text'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border-color/50">
                {rightNavItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-3 text-base font-medium text-secondary-text hover:bg-soft-accent/50 hover:text-primary-text rounded-lg transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleGetStarted();
                  }}
                  className="w-full mt-4"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
