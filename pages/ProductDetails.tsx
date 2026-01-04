
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import Loader from '../components/Loader';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        try {
          const data = await api.getProductById(id);
          if (data) setProduct(data);
        } catch (error) {
          console.error("Failed to fetch product", error);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center dark:bg-slate-950 min-h-screen transition-colors">
      <Loader size="lg" />
      <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium animate-pulse">Loading fresh details...</p>
    </div>
  );
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors">Product not found</div>;

  const handleOrder = async () => {
    const userStr = localStorage.getItem('agri_user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    
    await api.createOrder([{
      product: product.id,
      quantity: quantity
    }]);

    alert('Order placed successfully!');
    navigate('/dashboard?tab=orders');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 font-medium mb-8 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-inner">
              <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                  <img src={`https://picsum.photos/seed/${product.id}-${i}/200`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details Content */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2 transition-colors">
                <ShieldCheck className="h-4 w-4" /> Farmer Certified
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 transition-colors">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4" />
                  <span className="ml-2 text-sm text-slate-500">(12 reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 transition-colors" />
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-500 transition-colors">From {product.farmerName}</div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
                ₹{product.price.toFixed(2)} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">per {product.unit}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 transition-colors">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                {product.description}
                Our products are harvested at the peak of freshness. We take pride in sustainable farming 
                methods that respect the land and provide the highest nutritional value for our community.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-sm transition-colors">
                  <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Direct Shipping</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Ships within 24 hours</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-sm transition-colors">
                  <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Fresh Guarantee</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Refund if not satisfied</div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-14 transition-colors">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-xl font-bold transition-colors dark:text-slate-100"
                  >
                    -
                  </button>
                  <div className="w-12 text-center font-bold text-lg dark:text-slate-100">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-xl font-bold transition-colors dark:text-slate-100"
                  >
                    +
                  </button>
                </div>
                <div className="flex-grow">
                   <button 
                    onClick={handleOrder}
                    disabled={!product.stock || product.stock < 1}
                    className={`w-full flex items-center justify-center gap-2 h-14 rounded-xl font-bold shadow-lg transition-all ${
                       !product.stock || product.stock < 1 
                       ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 shadow-none' 
                       : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" /> 
                    {!product.stock || product.stock < 1 ? 'Out of Stock' : 'Buy Now'}
                  </button>
                </div>
              </div>
              <p className={`text-center text-sm font-bold ${(!product.stock || product.stock < 5) ? 'text-orange-500' : 'text-emerald-600'}`}>
                {product.stock ? `${product.stock} units available` : 'Currently out of stock'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
