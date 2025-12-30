
import React, { useState, useEffect } from 'react';
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
  X,
  FileText,
  Search,
  Upload,
  ImagePlus,
  ChevronRight,
  ChevronLeft,
  Star,
  User as UserIcon
} from 'lucide-react';
import { User, Product, Order, Transaction } from '../types';
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
  
  // Product Modal State
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

  // Settings State (Moved to top-level to fix Error #310)
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prod, ord, trans] = await Promise.all([
        api.getProducts({ available: 'all' }),
        api.getOrders(),
        api.getTransactions()
      ]);
      // The backend already filters orders and transactions by the authenticated user/farmer.
      // But we still filter products by farmerId just in case getProducts returns all (usually it does for public view).
      // But we still filter products by farmerId just in case getProducts returns all (usually it does for public view).
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

  const handleUpdateStatus = async (id: string, status: any) => {
    await api.updateOrderStatus(id, status);
    fetchData();
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
        stock: product.stock
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
      
      // Update local storage to reflect changes immediately on reload
      const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
      const updatedUser = { 
        ...currentUser, 
        farmName: farmSettings.name, 
        location: farmSettings.loc, 
        farmDescription: farmSettings.desc 
      };
      localStorage.setItem('agri_user', JSON.stringify(updatedUser));
      
      showToast('Business Profile Saved!', 'success');
      // Update local user object context if needed, or just refetch
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

      // Update local storage
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-emerald-600 dark:text-emerald-500 text-sm font-bold hover:underline">View All</button>
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

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Inventory Status</h3>
                  <button onClick={() => setActiveTab('products')} className="text-emerald-600 dark:text-emerald-500 text-sm font-bold hover:underline">Manage</button>
                </div>
                <div className="space-y-4">
                  {products.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300 transition-colors">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Marketplace</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add or remove items from your public farm shop.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                 <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                     type="text"
                     placeholder="Search products..."
                     className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                     value={inventorySearch}
                     onChange={(e) => setInventorySearch(e.target.value)}
                    />
                 </div>
                 <select
                   className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100 font-bold"
                   value={inventoryAvailability}
                   onChange={(e: any) => setInventoryAvailability(e.target.value)}
                 >
                   <option value="all">All Status</option>
                   <option value="true">Available</option>
                   <option value="false">Unavailable</option>
                 </select>
                <button 
                  onClick={() => handleOpenProductModal()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" /> New Product
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-4">Item Details</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Stock</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products
                    .filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
                      const matchesAvailability = 
                        inventoryAvailability === 'all' || 
                        (inventoryAvailability === 'true' && p.available) || 
                        (inventoryAvailability === 'false' && !p.available);
                      return matchesSearch && matchesAvailability;
                    })
                    .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                          <div className="font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{p.category}</td>
                      <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-100">₹{p.price.toFixed(2)}<span className="text-xs text-slate-500 dark:text-slate-400">/{p.unit}</span></td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleToggleAvailability(p.id, p.available)}
                            title={p.available ? "Set Unavailable" : "Set Available"}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            style={{ backgroundColor: p.available ? '#10b981' : '#cbd5e1' }}
                          >
                            <span
                              className={`${
                                p.available ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                            />
                          </button>
                          <button onClick={() => handleOpenProductModal(p)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
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
                    {/* Card Header */}
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
                         {/* Buyer Info */}
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

                         {/* Order Total */}
                         <div className="text-right">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order Value</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{(order.totalAmount || 0).toFixed(2)}</div>
                            <div className="text-xs text-slate-400 mt-1">{order.items?.length || 0} items</div>
                         </div>
                      </div>

                      {/* Review Section */}
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

                    {/* Actions Footer */}
                    {(order.status === 'Pending' || order.status === 'Accepted' || order.status === 'Shipped') && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end items-center flex-wrap">
                        {order.status === 'Pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(order.id, 'Rejected')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm">
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                            <button onClick={() => handleUpdateStatus(order.id, 'Accepted')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95">
                              <CheckCircle2 className="h-4 w-4" /> Accept Order
                            </button>
                          </>
                        )}
                        {order.status === 'Accepted' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95">
                             <Package className="h-4 w-4" /> Mark Shipped
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95">
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
      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-4 duration-300 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Farm Business Profile</h3>
            <div className="max-w-xl space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Legal Farm Name</label>
                    <input 
                      type="text" 
                      value={farmSettings.name} 
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Market Location</label>
                    <input 
                      type="text" 
                      value={farmSettings.loc} 
                      onChange={e => setFarmSettings({...farmSettings, loc: e.target.value})} 
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                    />
                  </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Public Description</label>
                     <textarea 
                       rows={4} 
                       value={farmSettings.desc} 
                       onChange={e => setFarmSettings({...farmSettings, desc: e.target.value})} 
                       className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                     />
                   </div>
                </div>
                <button 
                onClick={handleUpdateProfile} 
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md active:scale-95"
               >
                 Update Business Info
               </button>

               <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

               <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">My Personal Details</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={personalSettings.name} 
                      onChange={e => setPersonalSettings({...personalSettings, name: e.target.value})} 
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={personalSettings.email} 
                      onChange={e => setPersonalSettings({...personalSettings, email: e.target.value})} 
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={personalSettings.phone} 
                      onChange={e => setPersonalSettings({...personalSettings, phone: e.target.value})} 
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all" 
                    />
                  </div>
               </div>
               <button 
                 onClick={handleUpdatePersonalDetails} 
                 className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md active:scale-95"
               >
                 Update Personal Info
               </button>
            </div>
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
      {/* Enhanced Product Modal */}
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

              {/* Image Upload Area */}
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
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price (₹)</label>
                  <input 
                    type="number" step="0.01" required 
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
                    value={productFormData.price}
                    onChange={e => setProductFormData({...productFormData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Unit</label>
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

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800">
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
            { id: 'orders', label: 'Incoming Requests', icon: ShoppingCart },
            { id: 'transactions', label: 'Financial Logs', icon: Wallet },
            { id: 'settings', label: 'Business Profile', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
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
        </header>
        {loading ? (
          <div className="py-20 text-center">
            <Loader size="lg" />
            <p className="text-slate-500 mt-4 font-medium animate-pulse">Synchronizing with marketplace...</p>
          </div>
        ) : renderContent()}
      </main>
    </div>
  );
};

export default FarmerDashboard;
