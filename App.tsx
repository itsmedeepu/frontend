import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { User } from './types';
import { CartProvider } from './context/CartContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import CartModal from './components/CartModal';
import { useToast } from './context/ToastContext';
import Toast from './components/Toast';
import Loader from './components/Loader';
import TopLoader from './components/TopLoader';

const Home = lazy(() => import('./pages/Home'));
const Farms = lazy(() => import('./pages/Farms'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Sustainability = lazy(() => import('./pages/Sustainability'));

const SuspenseLoader: React.FC = () => {
  const { startLoading, stopLoading } = useLoading();
  
  useEffect(() => {
    startLoading();
    return () => stopLoading();
  }, [startLoading, stopLoading]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader size="lg" />
    </div>
  );
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User, message: string = 'Login Successful!') => {
    setUser(userData);
    localStorage.setItem('agri_user', JSON.stringify(userData));
    showToast(message, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agri_user');
    showToast('Logged out successfully', 'info');
  };

  const refreshUser = () => {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <HashRouter>
        <TopLoader />
        <CartModal />
        <Toast />
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          
          <main className="flex-grow">
            <Suspense fallback={<SuspenseLoader />}>
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/farms" element={<Farms />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register onLogin={handleLogin} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/sustainability" element={<Sustainability />} />
                
                <Route 
                  path="/dashboard/*" 
                  element={
                    user ? (
                      (() => {

                        const isFarmer = user.role?.toLowerCase() === 'farmer';
                        return isFarmer ? <FarmerDashboard user={user} onUserUpdate={refreshUser} /> : <UserDashboard user={user} onUserUpdate={refreshUser} />;
                      })()
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </HashRouter>
    </CartProvider>
  );
};

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
};

export default App;
