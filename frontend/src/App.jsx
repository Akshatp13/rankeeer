import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WeaknessDetection from './pages/WeaknessDetection';
import SmartRevision from './pages/SmartRevision';
import RankPredictor from './pages/RankPredictor';
import TestGenerator from './pages/TestGenerator';
import ExamSimulator from './pages/ExamSimulator';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import ExamCatalog from './pages/ExamCatalog';
import AuthCallback from './pages/AuthCallback';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-slate-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.isNewUser && !user?.selectedExam && location.pathname !== '/exam-catalog') {
    return <Navigate to="/exam-catalog" replace />;
  }

  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/auth/callback" element={<PageWrapper><AuthCallback /></PageWrapper>} />

        {/* Onboarding */}
        <Route path="/exam-catalog" element={<PrivateRoute><PageWrapper><ExamCatalog /></PageWrapper></PrivateRoute>} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<PrivateRoute><PageWrapper><Dashboard /></PageWrapper></PrivateRoute>} />
        <Route path="/weakness" element={<PrivateRoute><PageWrapper><WeaknessDetection /></PageWrapper></PrivateRoute>} />
        <Route path="/revision" element={<PrivateRoute><PageWrapper><SmartRevision /></PageWrapper></PrivateRoute>} />
        <Route path="/predictor" element={<PrivateRoute><PageWrapper><RankPredictor /></PageWrapper></PrivateRoute>} />
        <Route path="/test-gen" element={<PrivateRoute><PageWrapper><TestGenerator /></PageWrapper></PrivateRoute>} />
        <Route path="/simulator" element={<PrivateRoute><PageWrapper><ExamSimulator /></PageWrapper></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><PageWrapper><Settings /></PageWrapper></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><PageWrapper><Chat /></PageWrapper></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        <Router>
          <AnimatedRoutes />
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;

