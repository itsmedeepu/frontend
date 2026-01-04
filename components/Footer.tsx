import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4">AgriDirect</h3>
            <p className="max-w-md text-slate-400 leading-relaxed">
              Empowering local farmers by connecting them directly with conscious consumers. 
              Fresh produce, fair prices, and a more sustainable future for agriculture.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link></li>
              <li><Link to="/sustainability" className="hover:text-emerald-400 transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Farmers</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Become a Seller</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing Policies</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Logistics Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AgriDirect Platform. Supporting local growth.</p>
          <p className="mt-2 text-slate-600">Designed by Deepak S and Team• v{import.meta.env.APP_VERSION || '0.0.0'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
