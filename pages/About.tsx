import React from 'react';
import { Heart, Users, Leaf, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <div className="relative py-20 bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Cultivating a Better Future
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            We are bridging the gap between local farmers and conscious consumers, creating a transparent, fair, and sustainable food ecosystem for everyone.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-6">
              <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              To empower farmers with fair market access while providing families with the freshest, healthiest produce. We believe that good food shouldn't cost the earth—literally or figuratively.
            </p>
            <ul className="space-y-4">
              {[
                'Direct-to-consumer access for farmers',
                'Fair pricing without middleman markups',
                '100% traceable, locally sourced produce',
                'Supporting sustainable farming practices'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-slate-700 dark:text-slate-300">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full mr-3"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-600 rounded-3xl rotate-3 opacity-20 transform scale-95"></div>
             <img 
               src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800" 
               alt="Farmer in field" 
               className="relative rounded-3xl shadow-2xl z-10"
             />
          </div>
        </div>
      </div>

      {/* Values Stats */}
      <div className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">500+</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Partner Farmers</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">10k+</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Happy Families</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-transform">
              <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">100%</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Eco-friendly Packaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
