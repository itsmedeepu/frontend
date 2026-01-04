import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  History, 
  ChevronRight,
  ShoppingBag,
  Star,
  User as UserIcon,
  ShieldAlert,
  Settings,
  Mail,
  MapPin,
  Phone,
  Search,
  Filter,
  Package,
  Menu,
  MessageCircle,
  X
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import { User, Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import ReviewModal from '../components/ReviewModal';
import ConfirmationModal from '../components/ConfirmationModal';

interface DashboardProps {
  user: User;
  onUserUpdate?: () => void;
}

const UserDashboard: React.FC<DashboardProps> = ({ user: initialUser, onUserUpdate }) => {

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'orders' | 'profile' | 'settings' | null;
  
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'settings'>(initialTab || 'profile');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  // Confirmation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<{ id: string; farmerName: string; farmerId: string } | null>(null);


  
  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    location: user.address || user.location || '',
    phone: user.phone || ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast("New passwords do not match", 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", 'error');
      return;
    }

    try {
      await api.changePassword({
        oldpassword: passwordForm.oldPassword,
        newpassword: passwordForm.newPassword
      });
      showToast('Password updated successfully', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error');
    }
  };

  const isDirty = 
    profileForm.name !== user.name ||
    profileForm.email !== user.email ||
    profileForm.phone !== (user.phone || '') ||
    profileForm.location !== (user.address || user.location || '');

  const validate = () => {
    if (!profileForm.name.trim()) return "Name cannot be empty";
    if (!profileForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email";
    if (!profileForm.phone.match(/^\d{10}$/)) return "Phone number must be 10 digits";
    if (!profileForm.location.trim()) return "Address cannot be empty";
    return null;
  };

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const data = await api.getOrders(status);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [user.id, statusFilter]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    try {
      const res = await api.updateUserDetails({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.location
      });
      setUser(res.user);
      localStorage.setItem('agri_user', JSON.stringify(res.user));
      localStorage.setItem('agri_user', JSON.stringify(res.user));
      showToast('Your profile has been updated!', 'success');
      if (onUserUpdate) onUserUpdate();
    } catch (error: any) {
      showToast(`Update failed: ${error.message}`, 'error');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      await api.cancelOrder(orderToCancel);
      showToast('Order cancelled successfully', 'success');
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel order', 'error');
    } finally {
      setOrderToCancel(null);
    }
  };



  const handleOpenReview = (order: any) => {
    const farmerName = order.farmer?.farmDetails?.farmName || order.farmer?.name || 'Farmer';
    setReviewOrder({ 
      id: order._id, 
      farmerName,
      farmerId: order.farmer?._id || order.farmer 
    });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewOrder) return;

    try {
      await api.addReview({
        orderId: reviewOrder.id,
        farmerId: reviewOrder.farmerId,
        rating,
        comment
      });
      showToast('Review submitted successfully!', 'success');
      fetchOrders(statusFilter); // Refresh orders to show the new rating
    } catch (error: any) {
      showToast(error.message || 'Failed to submit review', 'error');
      throw error; // Re-throw to let modal know it failed
    }
  };

  const handleResetPassword = async () => {
    showToast('Security check: A reset link has been dispatched to your email.', 'info');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or Product..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm transition-all shadow-sm appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  {['All', 'Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-slate-100 hover:scrollbar-thumb-emerald-400">
            {orders
              .filter(order => {
                // First, apply search filter
                const searchLower = searchQuery.toLowerCase();
                const matchesId = (order.id || '').toLowerCase().includes(searchLower);
                const matchesProducts = order.items.some((item: any) => 
                  (item.product?.name || '').toLowerCase().includes(searchLower)
                );
                const matchesSearch = matchesId || matchesProducts;
                
                if (!matchesSearch) return false;
                
                // Check if there are any pending orders
                const hasPendingOrders = orders.some(o => o.status === 'Pending');
                
                // If there are pending orders and this is a cancelled order,
                // only show it if the user explicitly filtered for 'Cancelled' or 'All'
                if (hasPendingOrders && order.status === 'Cancelled') {
                  return statusFilter === 'Cancelled' || statusFilter === 'All';
                }
                
                return true;
              })
              .map(order => (
              <div key={order._id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Order #{order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                    order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 
                    order.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-5">
                  {/* Items List */}
                  <div className="mb-6 space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img 
                          src={getImageUrl(item.product?.image)} 
                          alt={item.product?.name || 'Product'}
                          className="h-12 w-12 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.product?.name || 'Unknown Product'}</div>
                          <div className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.product?.price || 0}</div>
                        </div>
                        <div className="font-bold text-slate-700 dark:text-slate-300">₹{item.quantity * (item.product?.price || 0)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Farmer Info & Total */}
                  <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Farmer Details</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {order.farmer?.farmDetails?.farmName || order.farmer?.name || 'Local Farm'}
                        </div>
                        {order.farmer?.email && <div className="text-xs text-slate-500 font-medium mb-0.5">{order.farmer.email}</div>}
                        <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                          {order.farmer?.phone && <span>📞 {order.farmer.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Amount</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{order.totalAmount}</div>
                    </div>
                  </div>

                  {/* Delivery Tracking Details */}
                  {(order.status === 'Shipped' || order.status === 'Delivered') && order.delivery && (
                    <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Live Delivery Tracking</span>
                        </div>
                        {order.delivery.shippedDate && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Shipped: {new Date(order.delivery.shippedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Delivery Partner Name</div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.delivery.carrierName || 'Pending'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Delivery Tracking ID</div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{order.delivery.trackingId || 'Not available'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Delivery Phone Number</div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.delivery.phone || 'Not provided'}</div>
                        </div>
                      </div>
                      {order.delivery.deliveredDate && (
                        <div className="mt-3 pt-3 border-t border-blue-100/50 dark:border-blue-900/20 text-right">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase mr-2">Order Delivered On:</span>
                          <span className="text-sm font-bold text-emerald-600">{new Date(order.delivery.deliveredDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Cancellation Reason */}
                  {(order.status === 'Cancelled' || order.status === 'Rejected') && order.cancellationReason && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Cancellation Reason</span>
                      </div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        "{order.cancellationReason}"
                      </p>
                    </div>
                  )}

                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end items-center">
                   {order.status === 'Pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-all shadow-sm hover:shadow"
                      >
                       <ShieldAlert className="h-4 w-4" /> Cancel Order
                      </button>
                    )}
                    
                    {order.status === 'Delivered' && (
                       <div className="flex gap-2">
                        {order.review ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Your Rating:</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= order.review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenReview(order)}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <Star className="h-4 w-4" /> Rate Farm
                          </button>
                        )}
                       </div>
                    )}

                    {(order.status === 'Pending' || order.status === 'Accepted' || order.status === 'Shipped') && (
                       <span className="text-xs font-medium text-slate-400 italic px-2">Track status</span>
                    )}
                    {order.status === 'Rejected' || order.status === 'Cancelled' && (
                       <span className="text-xs font-medium text-slate-400 italic px-2">No actions available</span>
                    )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No purchase history</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Explore seasonal produce from local farmers.</p>
                <a href="/" className="inline-block px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all">Go to Marketplace</a>
              </div>
            )}
          </div>
        </div>
      );
      case 'profile':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Personal Account Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all"
                      value={profileForm.name}
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="tel" 
                      className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Email</label>
                <div className="relative group">
                   <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                   <input 
                    type="email" 
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all"
                    value={profileForm.email}
                    onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Delivery Address</label>
                <div className="relative group">
                   <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                   <input 
                    type="text" 
                    placeholder="Enter full shipping address"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all"
                    value={profileForm.location}
                    onChange={e => setProfileForm({...profileForm, location: e.target.value})}
                  />
                </div>
              </div>
              {isDirty && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button type="submit" className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 w-full md:w-auto">
                    Save Profile Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Security Hub</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <ShieldAlert className="h-6 w-6 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Forgot Password?</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Receive a reset link via email.</div>
                    </div>
                  </div>
                  <button onClick={async () => {
                    try {
                      await api.forgotPassword(user.email);
                      showToast('Reset link sent to your email', 'success');
                    } catch(e: any) { showToast(e.message, 'error'); }
                  }} className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-all">Send Link</button>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Change Password</h4>
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                        value={passwordForm.oldPassword}
                        onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 transition-all"
                        value={passwordForm.confirmNewPassword}
                        onChange={e => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95">Update Password</button>
                  </form>
               </div>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-slate-400 italic">Select a tab to view details.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors relative">
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
      
      {reviewOrder && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          farmerName={reviewOrder.farmerName}
        />
      )}



      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
             <UserIcon className="h-5 w-5" />
           </div>
           <span className="font-bold text-slate-900 dark:text-slate-100">User Portal</span>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new Event('openChatWidget'))}
          className="p-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
        >
          <MessageCircle className="h-6 w-6" />
          {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span> */}
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:w-72 md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative inline-block mb-4 mt-2 md:mt-0">
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`} className="h-24 w-24 rounded-3xl mx-auto border-4 border-slate-50 dark:border-slate-800 shadow-xl" alt="" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-100 dark:bg-emerald-950/40 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-md">
              <Star className="h-5 w-5 fill-current" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-center">{user.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-medium text-center">{user.email}</p>
          {user.phone && <p className="text-emerald-600 text-xs mb-4 font-bold flex items-center justify-center gap-1.5"><Phone className="h-3 w-3" /> {user.phone}</p>}
          
          <div className="flex justify-center gap-4 w-full border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-lg">{orders.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Total Orders</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'profile', label: 'My Details', icon: UserIcon },
            { id: 'orders', label: 'Order History', icon: History },
            { id: 'settings', label: 'Account Safety', icon: ShieldAlert },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none translate-x-1' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1'
              }`}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize tracking-tight">{activeTab.replace('_', ' ')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your account and view your activities.</p>
        </header>
        
        {loading && activeTab === 'orders' ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader size="md" />
            <p className="text-slate-500 mt-4 text-sm font-medium animate-pulse">Loading your orders...</p>
          </div>
        ) : renderContent()}
      </main>
      
      <ChatWidget userId={user.id} role="customer" />
    </div>
  );
};

export default UserDashboard;
