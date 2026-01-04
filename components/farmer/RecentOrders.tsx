import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Order } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
  onViewAll: () => void;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, onViewAll }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Recent Orders</h3>
        <button onClick={onViewAll} className="text-emerald-600 dark:text-emerald-500 text-sm font-bold hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {orders.slice(0, 5).map(order => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700">
                <ShoppingCart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{order.user?.name || 'Customer'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">₹{(order.totalAmount || 0).toFixed(2)}</div>
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                order.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
              }`}>
                {order.status}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center text-slate-500 py-4 italic">No orders yet.</p>}
      </div>
    </div>
  );
};

export default RecentOrders;
