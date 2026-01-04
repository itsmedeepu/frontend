import React from 'react';
import { Leaf, Recycle, Sun, TreeDeciduous } from 'lucide-react';

const Sustainability = () => {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors">
      <div className="py-20 bg-emerald-50 dark:bg-emerald-950/20 text-center px-4">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-sm">Our Commitment</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4 mb-6">Growing Green, Living Clean</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Sustainability isn't just a buzzword for us. It's the core of how we operate, pack, and check every single order.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
           <div className="order-2 md:order-1">
             <img 
               src="https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b1e?auto=format&fit=crop&q=80&w=800" 
               alt="Sustainable Farming" 
               className="rounded-3xl shadow-xl"
             />
           </div>
           <div className="flex flex-col justify-center order-1 md:order-2">
             <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
               <TreeDeciduous className="h-6 w-6" />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Supporting Regenerative Agriculture</h2>
             <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
               We prioritize working with farmers who use regenerative practices—methods that restore soil health, increase biodiversity, and sequester carbon. By buying from them, you are directly funding a healther planet.
             </p>
             <button className="self-start text-emerald-600 font-bold hover:underline">Learn about our criteria &rarr;</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Recycle,
              title: "Plastic-Free Packaging",
              desc: "95% of our packaging is compostable or recyclable. We use banana leaves, kraft paper, and jute bags."
            },
            {
              icon: Sun,
              title: "Solar Powered Warehouses",
              desc: "Our primary sorting centers utilize solar energy to power cooling units, reducing our carbon footprint."
            },
            {
              icon: Leaf,
              title: "Zero Food Waste",
              desc: "Ugly produce that doesn't meet aesthetic standards is donated to food banks or used for composting."
            }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
               <item.icon className="h-10 w-10 text-emerald-600 mb-6" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
               <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
