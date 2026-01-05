import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, User as UserIcon, Power, Menu, Tractor, ShoppingBag, X, Sun, Moon, Bell, MessageCircle, ExternalLink } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {

  const navigate = useNavigate();
  const { toggleCart, items, isOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [orderCount, setOrderCount] = useState(0);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (user && user.role?.toLowerCase() === 'farmer') {
      const fetchOrdersForCount = async () => {
        try {
          const orders = await api.getOrders('Pending');
          setOrderCount(orders.length);
        } catch (error) {
          console.error("Failed to fetch order count", error);
        }
      };
      fetchOrdersForCount();
      const interval = setInterval(fetchOrdersForCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" id="nav-logo" className="flex items-center gap-2 group">
              <ShoppingBasket className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Agri<span className="text-emerald-600">Direct</span></span>
            </Link>
            
            {(!user || user.role?.toLowerCase() !== 'farmer') && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 font-medium transition-colors">Marketplace</Link>
                <a 
                  href="https://drive.google.com/file/d/1Ok0qaoV-Gbswm9LAzUHiH3LuukwlTC8E/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Video Explanation
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && user.role?.toLowerCase() === 'farmer' && (
              <Link 
                to="/dashboard?tab=orders"
                id="nav-dashboard"
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors group/bell"
                title="Incoming Requests"
              >
                <Bell className="h-6 w-6 group-hover/bell:rotate-12 transition-transform" />
                {orderCount > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                    {orderCount}
                  </span>
                )}
              </Link>
            )}

            {user && user.role?.toLowerCase() !== 'farmer' && (
              <button 
                onClick={toggleCart}
                id="nav-cart"
                className="relative p-2 text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
                {!isOpen && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <>
                <Link to="/dashboard" id="nav-dashboard" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                  {user.role === 'farmer' ? <Tractor className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                  <span className="hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
                </Link>

              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">Login</Link>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <Link to="/register" className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-shadow shadow-sm">Join Us</Link>
              </div>
            )}
            
            {user && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                title="Messages"
              >
                <MessageCircle className="h-6 w-6" />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                theme === 'dark' ? 'bg-slate-700 focus:ring-offset-slate-900' : 'bg-slate-200'
              } ml-2`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <div
                className={`absolute top-1 left-1 bg-white rounded-full h-6 w-6 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="h-3.5 w-3.5 text-slate-800" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
            </button>

            {user && (
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-500 transition-colors ml-2"
                title="Logout"
              >
                <Power className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
