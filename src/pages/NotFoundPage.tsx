import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';
import { SectionHeader } from '../components';
import { Card } from '../components';
import { Footer } from '../components';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-6 bg-soft-accent rounded-2xl flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-6xl">🚨</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl font-bold text-primary-text mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="text-xl text-secondary-text mb-8"
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
              rightIcon="→"
            >
              Go Home
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/scanner')}
            >
              Start Scanning
            </Button>
          </motion.div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card variant="bordered" padding="md" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-soft-accent rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <h3 className="font-semibold text-primary-text mb-2">Visit Homepage</h3>
            <p className="text-sm text-secondary-text mb-4">
              Return to the main page to learn more about VIGIL
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </Card>

          <Card variant="bordered" padding="md" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-soft-accent rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-primary-text mb-2">Start Scanning</h3>
            <p className="text-sm text-secondary-text mb-4">
              Analyze suspicious content with VIGIL
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/scanner')}>
              Open Scanner
            </Button>
          </Card>

          <Card variant="bordered" padding="md" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-soft-accent rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-primary-text mb-2">Learn More</h3>
            <p className="text-sm text-secondary-text mb-4">
              Discover how VIGIL works and what it can detect
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/about')}>
              About VIGIL
            </Button>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
