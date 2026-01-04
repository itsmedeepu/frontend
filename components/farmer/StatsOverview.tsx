import React from 'react';
import { Wallet, ShoppingCart, Package, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  revenue: number;
  totalOrders: number;
  totalProducts: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ revenue, totalOrders, totalProducts }) => {
  const stats = [
    { label: 'Total Revenue', value: `₹${revenue.toFixed(2)}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Live Products', value: totalProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
