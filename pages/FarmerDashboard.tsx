
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  Plus, 
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Trash2,
  Edit2,
  FileText,
  Search,
  Upload,
  ImagePlus,
  ChevronRight,
  ChevronLeft,
  Star,
  User as UserIcon,
  Menu,
  X,
  MessageCircle,
  Bell
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import StatsOverview from '../components/farmer/StatsOverview';
import RecentOrders from '../components/farmer/RecentOrders';
import InventoryTable from '../components/farmer/InventoryTable';
import OrderManagement from '../components/farmer/OrderManagement';
import FarmSettings from '../components/farmer/FarmSettings';
import { User, Product, Order, Transaction, Address } from '../types';
import { api } from '../services/api';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

interface DashboardProps {
  user: User;
  onUserUpdate?: () => void;
}

const FarmerDashboard: React.FC<DashboardProps> = ({ user, onUserUpdate }) => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as any;
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'transactions' | 'settings'>(initialTab || 'overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryAvailability, setInventoryAvailability] = useState<'true' | 'false' | 'all'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    unit: 'kg',
    category: 'veggies',
    stock: 0
  });


  const [farmSettings, setFarmSettings] = useState({
    name: user.farmName || '',
    loc: user.location || '',
    desc: user.farmDescription || ''
  });

  const [personalSettings, setPersonalSettings] = useState({
    name: user.name || '',
    email: user.email || '',
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


  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryFormData, setDeliveryFormData] = useState({
    carrierName: '',
    trackingId: '',
    phone: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: ''
  });
  const [modalStep, setModalStep] = useState(1);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const formatAddress = (addr: string | Address | undefined) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.doorNo, addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
  };
  


  const fetchData = async () => {
    setLoading(true);
    try {
      const [prod, ord, trans] = await Promise.all([
        api.getProducts({ available: 'all' }),
        api.getOrders(),
        api.getTransactions()
      ]);

      setProducts(prod.filter(p => p.farmerId === user.id));
      setOrders(ord);
      setTransactions(trans);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const stats = [
    { label: 'Total Revenue', value: `₹${transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Live Products', value: products.length, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleUpdateStatus = async (id: string, status: any, deliveryDetails?: any) => {
    await api.updateOrderStatus(id, status, deliveryDetails);
    fetchData();
  };

  const handleOpenCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancellationReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!cancelOrderId || !cancellationReason.trim()) {
      showToast('Please provide a reason for cancellation', 'error');
      return;
    }
    try {
      await api.updateOrderStatus(cancelOrderId, 'Cancelled', null, cancellationReason);
      setIsCancelModalOpen(false);
      showToast('Order cancelled successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel order', 'error');
    }
  };

  const handleOpenDeliveryModal = (order: any) => {
    setDeliveryOrderId(order.id);
    setDeliveryFormData({
      carrierName: '',
      trackingId: '',
      phone: '',
      customerName: order.user?.name || 'Customer',
      customerAddress: order.shippingAddress ? formatAddress(order.shippingAddress) : formatAddress(order.user?.address),
      customerPhone: order.user?.phone || '',
      customerEmail: order.user?.email || ''
    });
    setModalStep(1);
    setIsDeliveryModalOpen(true);
  };

  const handleConfirmShipping = async () => {
    if (!deliveryOrderId) return;
    
    if (!deliveryFormData.carrierName.trim()) {
      showToast('Please enter the Delivery Partner Name', 'error');
      return;
    }
    if (!deliveryFormData.trackingId.trim()) {
      showToast('Please enter the Tracking ID', 'error');
      return;
    }

    try {
      await handleUpdateStatus(deliveryOrderId, 'Shipped', {
        carrierName: deliveryFormData.carrierName,
        trackingId: deliveryFormData.trackingId,
        phone: deliveryFormData.phone,
        customerName: deliveryFormData.customerName,
        customerAddress: deliveryFormData.customerAddress,
        customerPhone: deliveryFormData.customerPhone,
        customerEmail: deliveryFormData.customerEmail
      });
      setIsDeliveryModalOpen(false);
      showToast('Order marked as shipped with delivery details', 'success');
    } catch (error) {
      showToast('Failed to update shipping details', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      fetchData();
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateProduct(id, { available: !currentStatus });
      fetchData();
      showToast(`Product is now ${!currentStatus ? 'Available' : 'Unavailable'}`, 'success');
    } catch (error) {
      console.error("Failed to toggle availability", error);
    }
  };

  const handleOpenProductModal = (product?: any) => {
    setImageFile(null);
    setImagePreview(product?.image || null);
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        category: product.category,
        stock: product.stock || 0
      });
    } else {
      setEditingProduct(null);
      setProductFormData({ name: '', description: '', price: 0, unit: 'kg', category: 'veggies', stock: 0 });
    }
    setIsProductModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description);
      formData.append('price', productFormData.price.toString());
      formData.append('unit', productFormData.unit);
      formData.append('category', productFormData.category);
      formData.append('stock', productFormData.stock.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsProductModalOpen(false);
      fetchData();
      showToast(editingProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
    } catch (error) {
      console.error("Failed to save product", error);
      showToast('Failed to save product', 'error');
    }
  };



  const validateBusinessProfile = () => {
    if (!farmSettings.name.trim()) return "Legal Farm Name is required";
    if (!farmSettings.loc.trim()) return "Market Location is required";
    if (!farmSettings.desc.trim()) return "Public Description is required";
    return null;
  };

  const validatePersonalDetails = () => {
    if (!personalSettings.name.trim()) return "Full Name is required";
    if (!personalSettings.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email address";
    if (!personalSettings.phone.match(/^\d{10}$/)) return "Phone number must be exactly 10 digits";
    return null;
  };

  const handleUpdateProfile = async () => {
    const error = validateBusinessProfile();
    if (error) {
      showToast(error, 'error');
      return;
    }

    try {
      await api.updateFarmDetails({ 
        farmName: farmSettings.name, 
        location: farmSettings.loc, 
        description: farmSettings.desc 
      });
      

      const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        farmName: farmSettings.name, 
        location: farmSettings.loc, 
        farmDescription: farmSettings.desc 
      };
      localStorage.setItem('agri_user', JSON.stringify(updatedUser));
      
      showToast('Business Profile Saved!', 'success');

      fetchData();
      if (onUserUpdate) onUserUpdate(); 
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleUpdatePersonalDetails = async () => {
    const error = validatePersonalDetails();
    if (error) {
      showToast(error, 'error');
      return;
    }

    try {
      await api.updateUserDetails({
        name: personalSettings.name,
        email: personalSettings.email,
        phone: personalSettings.phone
      });


      const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        name: personalSettings.name, 
        email: personalSettings.email, 
        phone: personalSettings.phone 
      };
      localStorage.setItem('agri_user', JSON.stringify(updatedUser));

      showToast('Personal Details Updated!', 'success');
      fetchData();
      if (onUserUpdate) onUserUpdate();
    } catch (error) {
      console.error("Failed to update personal details", error);
      showToast('Failed to update personal details', 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <StatsOverview 
              revenue={transactions.reduce((acc, t) => acc + t.amount, 0)}
              totalOrders={orders.length}
              totalProducts={products.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentOrders orders={orders} onViewAll={() => setActiveTab('orders')} />

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Inventory Status</h3>
                  <button onClick={() => setActiveTab('products')} className="text-emerald-600 dark:text-emerald-500 text-sm font-bold hover:underline">Manage</button>
                </div>
                <div className="space-y-4">
                  {products.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={getImageUrl(p.image)} className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{p.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.stock} <span className="text-slate-500 dark:text-slate-400 font-normal">{p.unit}</span></div>
                        <div className={`text-[10px] font-bold uppercase ${p.stock < 10 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {p.stock < 10 ? 'Restock Soon' : 'In Stock'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <InventoryTable 
            products={products}
            onAddProduct={() => handleOpenProductModal()}
            onEditProduct={handleOpenProductModal}
            onToggleAvailability={handleToggleAvailability}
          />
        );
      case 'orders':
        return (
          <OrderManagement 
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onOpenDeliveryModal={handleOpenDeliveryModal}
            onOpenCancelModal={handleOpenCancelModal}
          />
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FarmSettings 
              farmSettings={farmSettings}
              setFarmSettings={setFarmSettings}
              onUpdateProfile={handleUpdateProfile}
              userData={personalSettings}
              setUserData={setPersonalSettings}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              onUpdatePassword={handleUpdatePassword}
            />
          </div>
        );
      case 'transactions':
        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Financial Records</h3>
            <div className="space-y-4">
              {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Sale Transaction</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+₹{t.amount.toFixed(2)}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">{t.status}</div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-10 italic transition-colors">No transactions found.</p>}
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center text-slate-400 dark:text-slate-500 transition-colors font-medium">Coming Soon!</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors">

      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 transition-colors border dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-700 dark:text-blue-400">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delivery Details</h3>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {modalStep === 1 ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs text-blue-800 dark:text-blue-400 font-bold uppercase mb-2">Step 1: Verify Customer Info</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Please confirm or update the customer's contact and shipping details below.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer Name</label>
                        <input 
                          type="text"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium"
                          value={deliveryFormData.customerName}
                          onChange={e => setDeliveryFormData({...deliveryFormData, customerName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer Phone</label>
                        <input 
                          type="tel"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium"
                          value={deliveryFormData.customerPhone}
                          onChange={e => setDeliveryFormData({...deliveryFormData, customerPhone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer Email</label>
                      <input 
                        type="email"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium"
                        value={deliveryFormData.customerEmail}
                        onChange={e => setDeliveryFormData({...deliveryFormData, customerEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Shipping Address</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium resize-none"
                        placeholder="Enter full shipping address..."
                        value={deliveryFormData.customerAddress}
                        onChange={e => setDeliveryFormData({...deliveryFormData, customerAddress: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setModalStep(2)}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Next: Delivery Partner <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold uppercase mb-2">Step 2: Shipment Details</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Enter the third-party delivery information for tracking.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Delivery Partner / Boy Name</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400"
                        placeholder="e.g. Blue Dart / Rahul Kumar"
                        value={deliveryFormData.carrierName}
                        onChange={e => setDeliveryFormData({...deliveryFormData, carrierName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tracking ID / Order Link</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400"
                        placeholder="e.g. AW123456789"
                        value={deliveryFormData.trackingId}
                        onChange={e => setDeliveryFormData({...deliveryFormData, trackingId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Partner Contact Number</label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400"
                        placeholder="e.g. 9876543210"
                        value={deliveryFormData.phone}
                        onChange={e => setDeliveryFormData({...deliveryFormData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setModalStep(1)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleConfirmShipping}
                      className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
                    >
                      Confirm Shipping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 transition-colors border dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-700 dark:text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{editingProduct ? 'Edit Listing' : 'Create New Listing'}</h3>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Title</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  placeholder="e.g. Heirloom Carrots"
                  value={productFormData.name}
                  onChange={e => setProductFormData({...productFormData, name: e.target.value})}
                />
              </div>


              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Product Image</label>
                <div className="flex items-center gap-5">
                  <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center relative group transition-colors hover:border-emerald-400 dark:hover:border-emerald-500">
                    {imagePreview ? (
                      <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                    ) : (
                      <ImagePlus className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    )}
                    <label className="absolute inset-0 cursor-pointer opacity-0 bg-black/40 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">Showcase your harvest. High-quality photos attract more buyers. (PNG, JPG up to 5MB)</p>
                    <label className="inline-block px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                      Select Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price per unit (₹)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all dark:text-slate-100"
                      value={productFormData.price}
                      onChange={e => setProductFormData({...productFormData, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Available Stock</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all dark:text-slate-100"
                      value={productFormData.stock}
                      onChange={e => setProductFormData({...productFormData, stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
                    value={productFormData.unit}
                    onChange={e => setProductFormData({...productFormData, unit: e.target.value})}
                  >
                    <option value="kg">per kg</option>
                    <option value="g">per 100g</option>
                    <option value="bunch">per bunch</option>
                    <option value="item">per item</option>
                    <option value="box">per box</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current Stock</label>
                  <input 
                    type="number" required 
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
                    value={productFormData.stock}
                    onChange={e => setProductFormData({...productFormData, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
                    value={productFormData.category}
                    onChange={e => setProductFormData({...productFormData, category: e.target.value})}
                  >
                    <option value="veggies">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="seeds">Seeds & Grains</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Detailed Description</label>
                <textarea 
                  rows={3} required 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Describe your harvest methods, variety, etc."
                  value={productFormData.description}
                  onChange={e => setProductFormData({...productFormData, description: e.target.value})}
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]">
                  {editingProduct ? 'Update Listing' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="bg-emerald-600 p-2 rounded-lg text-white">
             <LayoutDashboard className="h-5 w-5" />
           </div>
           <span className="font-bold text-slate-900 dark:text-slate-100">Farmer Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openChatWidget'))}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>
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
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 dark:shadow-none">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase">Farmer Portal</span>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff&bold=true`} 
                className="h-20 w-20 rounded-2xl border-4 border-slate-50 dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform" 
                alt={user.name}
              />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</h2>
              <p className="text-emerald-600 dark:text-emerald-500 text-xs font-bold uppercase tracking-wider mt-1">{user.farmName || 'Independent Farmer'}</p>
            </div>
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mt-4" />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard Summary', icon: LayoutDashboard },
            { id: 'products', label: 'Inventory Manager', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'transactions', label: 'Financial Logs', icon: Wallet },
            { id: 'settings', label: 'Business Profile', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none translate-x-1' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1'
              }`}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Support Status</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Marketplace Online</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 transition-colors">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back to your farm control center.</p>
          </div>
          <button 
            onClick={() => setActiveTab('orders')}
            className="p-3 bg-white dark:bg-slate-900 rounded-full text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm border border-slate-200 dark:border-slate-800 transition-all relative"
          >
            <Bell className="h-6 w-6" />
            {orders.some(o => o.status === 'Pending') && (
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900" />
            )}
          </button>
        </header>
        {loading ? (
          <div className="py-20 text-center">
            <Loader size="lg" />
            <p className="text-slate-500 mt-4 font-medium animate-pulse">Synchronizing with marketplace...</p>
          </div>
        ) : renderContent()}
      </main>
      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
               <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                 <XCircle className="h-6 w-6" /> Cancel Order
               </h3>
               <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                 <X className="h-6 w-6" />
               </button>
             </div>
             <div className="p-6">
               <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                 Please provide a reason for cancelling this order. This information will be visible to the customer.
               </p>
               <textarea
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] text-slate-900 dark:text-slate-100 placeholder-slate-400"
                 placeholder="Reason for cancellation (e.g., Out of stock, Quality issue...)"
                 value={cancellationReason}
                 onChange={(e) => setCancellationReason(e.target.value)}
               />
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
               <button 
                 onClick={() => setIsCancelModalOpen(false)}
                 className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 Go Back
               </button>
               <button 
                 onClick={handleConfirmCancellation}
                 disabled={!cancellationReason.trim()}
                 className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
               >
                 Confirm Cancel
               </button>
             </div>
          </div>
        </div>
      )}
      
      <ChatWidget userId={user.id || (user as any)._id} role="farmer" />
    </div>
  );
};

export default FarmerDashboard;
