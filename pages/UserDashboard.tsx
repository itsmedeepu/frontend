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
import UserOrders from '../components/user/UserOrders';
import UserProfile from '../components/user/UserProfile';
import SecuritySettings from '../components/user/SecuritySettings';
import { User, Order, Address } from '../types';
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
  

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<{ id: string; farmerName: string; farmerId: string } | null>(null);


  

  const parseAddress = (addr: string | Address | undefined): Address => {
    if (!addr) return { doorNo: '', street: '', city: '', state: '', zip: '' };
    if (typeof addr === 'string') return { doorNo: '', street: addr, city: '', state: '', zip: '' };
    return { doorNo: addr.doorNo || '', street: addr.street || '', city: addr.city || '', state: addr.state || '', zip: addr.zip || '' };
  };

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    address: parseAddress(user.address),
    phone: user.phone || ''
  });


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
    JSON.stringify(profileForm.address) !== JSON.stringify(parseAddress(user.address));

  const validate = () => {
    if (!profileForm.name.trim()) return "Name cannot be empty";
    if (!profileForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email";
    if (!profileForm.phone.match(/^\d{10}$/)) return "Phone number must be 10 digits";
    if (!profileForm.address.street.trim() || !profileForm.address.city.trim() || !profileForm.address.zip.trim()) return "Please complete your address (Street, City, Zip)";
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
        address: profileForm.address
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
      fetchOrders();
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
      fetchOrders(statusFilter);
    } catch (error: any) {
      showToast(error.message || 'Failed to submit review', 'error');
      throw error;
    }
  };

  const handleResetPassword = async () => {
    showToast('Security check: A reset link has been dispatched to your email.', 'info');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <UserOrders 
            orders={orders}
            onCancelOrder={handleCancelOrder}
            onOpenReviewModal={handleOpenReview}
          />
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
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Primary Delivery Address
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Door No / Flat</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12B"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all text-sm"
                      value={profileForm.address.doorNo}
                      onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, doorNo: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Pin Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 560001"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all text-sm"
                      value={profileForm.address.zip}
                      onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, zip: e.target.value}})}
                    />
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Street / Area</label>
                   <input 
                      type="text" 
                      placeholder="e.g. MG Road, Indiranagar"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all text-sm"
                      value={profileForm.address.street}
                      onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, street: e.target.value}})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all text-sm"
                      value={profileForm.address.city}
                      onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, city: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">State</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Karnataka"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-slate-100 transition-all text-sm"
                      value={profileForm.address.state}
                      onChange={e => setProfileForm({...profileForm, address: {...profileForm.address, state: e.target.value}})}
                    />
                  </div>
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

        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </div>


      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}


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
