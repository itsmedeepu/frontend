import React, { useState } from 'react';
import { Search, Package, User as UserIcon, XCircle, Star, Filter } from 'lucide-react';
import { Order } from '../../types';
import { getImageUrl } from '../../utils/imageHelper';

interface UserOrdersProps {
  orders: Order[];
  onCancelOrder: (id: string) => void;
  onOpenReviewModal: (order: Order) => void;
}

const UserOrders: React.FC<UserOrdersProps> = ({ orders, onCancelOrder, onOpenReviewModal }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order._id || order.id).toLowerCase().includes(orderSearch.toLowerCase()) ||
                          order.items.some(i => i.product.name.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300 transition-colors">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
         <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Orders</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your recent purchases.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 type="text"
                 placeholder="Search orders..."
                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                 value={orderSearch}
                 onChange={e => setOrderSearch(e.target.value)}
               />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select 
                className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer dark:text-slate-100"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
         </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
             <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shadow-sm">
                     <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-slate-900 dark:text-slate-100">Order #{ (order._id || order.id).slice(-6).toUpperCase() }</h4>
                       <span className="text-xs text-slate-400">•</span>
                       <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                       Total: <span className="text-slate-900 dark:text-slate-100 font-bold">₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
               </div>
               <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                  order.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                  order.status === 'Accepted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  order.status === 'Shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                  order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
               }`}>
                  {order.status}
               </div>
             </div>

             <div className="p-4 sm:p-6">
               <div className="space-y-4 mb-6">
                 {order.items.map((item: any, idx: number) => (
                   <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <img 
                           src={getImageUrl(item.product.image)} 
                           alt={item.product.name}
                           className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                         />
                         <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.product.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</div>
                         </div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                   </div>
                 ))}
               </div>

               {(order.status === 'Shipped' || order.status === 'Delivered') && order.delivery && (
                  <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                     <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Shipment Details</span>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase">Carrier</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{order.delivery.carrierName}</div>
                        </div>
                        <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase">Tracking ID</div>
                           <div className="text-sm font-bold text-blue-600 break-all">{order.delivery.trackingId}</div>
                        </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{order.delivery.status}</div>
                        </div>
                     </div>
                  </div>
               )}

               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {order.status === 'Pending' && (
                     <button 
                       onClick={() => onCancelOrder(order.id)}
                       className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                     >
                        <XCircle className="h-4 w-4" /> Cancel Order
                     </button>
                  )}
                  {order.status === 'Delivered' && !order.review && (
                      <button 
                         onClick={() => onOpenReviewModal(order)}
                         className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95 shadow-md shadow-emerald-100"
                      >
                         <Star className="h-4 w-4" /> Rate & Review
                      </button>
                  )}
                  {order.status === 'Delivered' && order.review && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-bold cursor-default">
                        <Star className="h-4 w-4 fill-slate-400 text-slate-400" /> Rated
                     </div>
                  )}
               </div>
             </div>
          </div>
        ))}
         {filteredOrders.length === 0 && (
            <div className="text-center py-20">
               <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Package className="h-10 w-10" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No orders found</h3>
               <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default UserOrders;
