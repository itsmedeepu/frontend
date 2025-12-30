
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Tractor, Leaf } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import Loader from '../components/Loader';

const Farms: React.FC = () => {
  const [farms, setFarms] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await api.getFarms();
      setFarms(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 transition-colors">Our Verified Farms</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl transition-colors">
            Meet the hard-working families behind your fresh produce. We manually verify every farm 
            to ensure they meet our strict quality and ethical standards.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader size="lg" />
            <p className="text-center text-slate-500 mt-4 animate-pulse">Finding local farms...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map(farm => (
              <div key={farm.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/20 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Tractor className="h-8 w-8 text-emerald-600 dark:text-emerald-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/40 px-3 py-1 rounded-full text-yellow-600 dark:text-yellow-500 text-sm font-bold">
                    <Star className="h-4 w-4 fill-current" /> 4.9
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">{farm.farmName}</h3>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4 transition-colors">
                  <MapPin className="h-4 w-4" /> {farm.location}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">
                  {farm.farmDescription || "A dedicated family farm focusing on heirloom varieties and sustainable land management practices."}
                </p>
                
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800 transition-colors">
                   <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                      <Leaf className="h-3 w-3" /> Organic Certified
                   </div>
                   <button className="ml-auto px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors">
                     View Shop
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Farms;
