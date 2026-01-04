import React, { useState } from 'react';
import { Search, Package, User as UserIcon, XCircle, CheckCircle2, Star } from 'lucide-react';
import { Order } from '../../types';

interface OrderManagementProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onOpenDeliveryModal: (order: Order) => void;
  onOpenCancelModal: (orderId: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
  orders, 
  onUpdateStatus, 
  onOpenDeliveryModal, 
  onOpenCancelModal 
}) => {
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const searchTerm = orderSearch.toLowerCase();
    const matchesSearch = (o.id || '').toLowerCase().includes(searchTerm) || 
                          (o.user?.name || 'Customer').toLowerCase().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300 transition-colors">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customer Requests</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search Order ID or Name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100 font-bold"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
       </div>
       <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
         {filteredOrders.map(order => (
   
           <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Order #{(order._id || order.id).slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                  order.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                  order.status === 'Accepted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  order.status === 'Shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                  order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                   <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                         <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                         <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Buyer Details</div>
                         <div className="font-bold text-slate-900 dark:text-slate-100">{order.user?.name || 'Customer'}</div>
                         {order.user?.email && <div className="text-xs text-slate-500">{order.user.email}</div>}
                         {order.user?.phone && <div className="text-xs text-emerald-600 font-medium mt-0.5">📞 {order.user.phone}</div>}
                      </div>
                   </div>

                    <div className="text-right">
                       <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order Value</div>
                       <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{(order.totalAmount || 0).toFixed(2)}</div>
                       <div className="text-xs text-slate-400 mt-1">{order.items?.length || 0} items</div>
                    </div>
                </div>

                {(order.status === 'Shipped' || order.status === 'Delivered') && order.delivery && (
                  <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                         <Package className="h-4 w-4 text-blue-600" />
                         <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Shipment Tracking Info</span>
                      </div>
                      {order.delivery.shippedDate && (
                        <span className="text-[10px] text-slate-500 font-medium">Shipped: {new Date(order.delivery.shippedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Carrier Name</div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.delivery.carrierName}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Tracking ID</div>
                          <div className="text-sm font-bold text-blue-600">{order.delivery.trackingId}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Partner Contact</div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.delivery.phone}</div>
                       </div>
                    </div>
                    {(order.delivery.deliveredDate || order.delivery.customerContact) && (
                      <div className="mt-3 pt-3 border-t border-blue-100/50 dark:border-blue-900/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {order.delivery.customerContact && (
                           <div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase">Customer Contact</div>
                             <div className="text-xs text-slate-600 dark:text-slate-400">{order.delivery.customerContact.phone} | {order.delivery.customerContact.email}</div>
                           </div>
                         )}
                         {order.delivery.deliveredDate && (
                           <div className="text-right">
                             <div className="text-[10px] font-bold text-emerald-500 uppercase">Delivered On</div>
                             <div className="text-xs font-bold text-emerald-600">{new Date(order.delivery.deliveredDate).toLocaleDateString()}</div>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                )}

                {order.status === 'Delivered' && order.review && (
                   <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="bg-white dark:bg-emerald-950 p-1.5 rounded-lg shadow-sm">
                          <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Customer Review</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= order.review!.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                              ))}
                            </div>
                          </div>
                          {order.review.comment && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{order.review.comment}"</p>
                          )}
                        </div>
                      </div>
                   </div>
                 )}
              </div>

              {(order.status === 'Pending' || order.status === 'Accepted' || order.status === 'Shipped' || order.status === 'Delivered') && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end items-center flex-wrap">
                  
                  {order.status === 'Pending' && (
                    <>
                      <button onClick={() => onOpenCancelModal(order.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                        <XCircle className="h-4 w-4" /> Cancel/Reject
                      </button>
                      <button onClick={() => onUpdateStatus(order.id, 'Accepted')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95">
                        <CheckCircle2 className="h-4 w-4" /> Accept Order
                      </button>
                    </>
                  )}
                  {order.status === 'Accepted' && (
                    <>
                      <button onClick={() => onOpenDeliveryModal(order)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95">
                         <Package className="h-4 w-4" /> Mark Shipped
                      </button>
                      <button onClick={() => onOpenCancelModal(order.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                          <XCircle className="h-4 w-4" /> Cancel
                      </button>
                     </>
                  )}
                  {order.status === 'Shipped' && (
                    <button onClick={() => onUpdateStatus(order.id, 'Delivered')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95">
                       <CheckCircle2 className="h-4 w-4" /> Mark Delivered
                    </button>
                  )}
                </div>
              )}
           </div>
           
         ))}
          {filteredOrders.length === 0 && <div className="text-center py-20 text-slate-500 font-medium italic">No orders found.</div>}
        
       </div>
    </div>
  );
};

export default OrderManagement;
