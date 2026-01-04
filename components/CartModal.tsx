import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const CartModal = () => {
  const { items, isOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card'>('COD');
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));
      
      await api.createOrder(orderItems, {
        paymentMode: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
      });
      showToast('Order placed successfully!', 'success');
      clearCart();
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes("address")) {
        showToast(error.message, 'error');
        // Close cart and navigate to profile
        toggleCart(); 
        navigate('/dashboard?tab=profile');
      } else {
        showToast(`Checkout failed: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { id: 'COD', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive' },
    { id: 'UPI', label: 'UPI Payment', icon: Wallet, description: 'PhonePe, GPay, Paytm' },
    { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={toggleCart} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-slate-900 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            Your Cart
          </h2>
          <button onClick={toggleCart} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Your cart is empty</p>
              <button 
                onClick={() => {
                  toggleCart();
                  navigate('/');
                }}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=200'}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.unit}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-6 text-center text-slate-800 dark:text-slate-100">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            if (item.quantity >= item.stock) return;
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          disabled={item.quantity >= item.stock}
                          className={`p-1 rounded-full ${
                             item.quantity >= item.stock 
                             ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                             : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-500">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Payment Method</h3>
              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <label 
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === option.id 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={paymentMethod === option.id}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <option.icon className={`h-5 w-5 ${paymentMethod === option.id ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${paymentMethod === option.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between mb-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Total</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">₹{cartTotal}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
