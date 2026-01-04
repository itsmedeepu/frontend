import React from 'react';
import { ShoppingBasket, Truck, PackageCheck, UserCheck, ArrowRight, Sprout } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Browse & Order',
      desc: 'Explore fresh, seasonal produce directly from local farm listings.',
      icon: ShoppingBasket,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      id: 2,
      title: 'Farmer Harvests',
      desc: 'Farmers get your order and harvest crops fresh from the field.',
      icon: Sprout,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      id: 3,
      title: 'Quality Check & Pack',
      desc: 'We ensure top quality and pack your goods in eco-friendly materials.',
      icon: PackageCheck,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    },
    {
      id: 4,
      title: 'Swift Delivery',
      desc: 'Our logistics partners bring the farm goodness right to your doorstep.',
      icon: Truck,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    },
    {
      id: 5,
      title: 'Enjoy Freshness',
      desc: 'Cook healthy meals and support local agriculture with every bite.',
      icon: UserCheck,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How AgriDirect Works</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From the soil to your soul. Experience the seamless journey of fresh produce.
          </p>
        </div>

        {/* Desktop Flow Chart */}
        <div className="hidden md:flex justify-between items-start relative mb-20">
          <div className="absolute top-12 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10"></div>
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center w-48 group">
              <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-lg border-4 border-white dark:border-slate-950 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-2">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Flow */}
        <div className="md:hidden space-y-12 relative">
          <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-800 -z-10"></div>
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-6 items-start relative">
              <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center shadow-md flex-shrink-0 z-10 border-4 border-slate-50 dark:border-slate-950`}>
                 <step.icon className="h-8 w-8" />
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-24 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="text-center mb-10">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[
               { q: 'How long does delivery take?', a: 'Typically within 24-48 hours of harvest to ensure maximum freshness.' },
               { q: 'Is there a minimum order?', a: 'No minimum order! Order as little or as much as you need.' },
               { q: 'Can I return bad produce?', a: 'Yes! We have a "Freshness Guarantee". If you receive damaged goods, we refund you instantly.' },
               { q: 'Do you support organic farmers?', a: 'Absolutely. We highlight verified organic farms with a special badge.' }
             ].map((faq, i) => (
               <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
                 <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{faq.q}</h4>
                 <p className="text-slate-600 dark:text-slate-400 text-sm">{faq.a}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
