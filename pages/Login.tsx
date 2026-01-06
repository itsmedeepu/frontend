import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShoppingBasket, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'farmer'>('customer');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const user = await api.login(email, password);
        onLogin(user);
        navigate('/dashboard'); 
    } catch (err: any) {
        showToast(err.message || 'Login failed', 'error');
    }
  };

  const fillDemoCredentials = (email: string, pass: string, userRole: 'customer' | 'farmer') => {
    setEmail(email);
    setPassword(pass);
    setRole(userRole);
    showToast(`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} credentials filled`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-600 p-3 rounded-2xl shadow-xl shadow-emerald-200">
                <ShoppingBasket className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">Welcome Back</h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              Or <Link to="/register" className="font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">create a new account</Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200 dark:shadow-none sm:rounded-3xl sm:px-10 border border-slate-200 dark:border-slate-800 transition-colors">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'customer' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    onClick={() => setRole('customer')}
                  >
                    Customer Login
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'farmer' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    onClick={() => setRole('farmer')}
                  >
                    Farmer Login
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                  <div className="mt-1 relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="email"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 font-medium"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="mt-1 relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none block w-full pl-10 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 font-medium"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember" type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 dark:border-emerald-800 rounded" />
                    <label htmlFor="remember" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Forgot password?</Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-95"
                >
                  Sign in <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Credentials Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-emerald-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-200 dark:border-emerald-800/50">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-2">Demo Access</h3>
                <p className="text-emerald-700/70 dark:text-slate-400 text-sm font-medium">Use these accounts to explore the platform instantly.</p>
              </div>

              <div className="space-y-4">
                {/* User Demo */}
                <button
                  onClick={() => fillDemoCredentials('testaccount@gmail.com', 'Test@12345', 'customer')}
                  className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                      <ShoppingBasket className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Customer Account</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">Email: testaccount@gmail.com</p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Pass: Test@12345</p>
                  </div>
                  <div className="mt-3 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to fill credentials →
                  </div>
                </button>

                {/* Farmer Demo */}
                <button
                  onClick={() => fillDemoCredentials('testfarmer@gmail.com', 'Farmer@12345', 'farmer')}
                  className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600">
                      <ShoppingBasket className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Farmer Account</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">Email: testfarmer@gmail.com</p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Pass: Farmer@12345</p>
                  </div>
                  <div className="mt-3 text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to fill credentials →
                  </div>
                </button>
              </div>

              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  Note: These are pre-configured test accounts with sample data for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
