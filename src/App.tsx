import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, Footer } from './components';
import { LoadingState } from './components';
import { themeService } from './services/storage';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ScannerPage = lazy(() => import('./pages/ScannerPage'));
const VisionPage = lazy(() => import('./pages/VisionPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const PageLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingState
      title="Loading..."
      steps={[{ id: 'loading', label: 'Loading page', status: 'pending' }]}
    />
  </div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Page transition wrapper
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Theme provider (simplified)
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = themeService.getEffectiveTheme();
    setTheme(savedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  }, []);

  return <div className={theme}>{children}</div>;
};

// Navigation progress indicator
const NavigationProgress = () => {
  const navigation = useNavigation();

  return (
    <AnimatePresence>
      {navigation.state === 'loading' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 2 }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed top-0 left-0 right-0 bg-primary-accent z-50"
        />
      )}
    </AnimatePresence>
  );
};

function App() {
  const location = useLocation();

  // Hide navbar on certain pages (like full-page views)
  const hideNavbar = ['/vision'].includes(location.pathname);

  return (
    <ThemeProvider>
      <NavigationProgress />
      
      <div className="min-h-screen bg-background flex flex-col">
        {!hideNavbar && <Navbar />}
        
        <main className="flex-1">
          <ScrollToTop />
          
          <Suspense fallback={<PageLoading />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/scanner" element={<PageWrapper><ScannerPage /></PageWrapper>} />
                <Route path="/vision" element={<PageWrapper><VisionPage /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
                <Route path="/insights" element={<PageWrapper><InsightsPage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
                <Route path="/analysis/:analysisId" element={<PageWrapper><AnalysisPage /></PageWrapper>} />
                <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        
        {!hideNavbar && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App;
