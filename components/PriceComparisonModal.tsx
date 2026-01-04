import React from 'react';
import { X, ShoppingCart, Leaf, Star, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { getImageUrl } from '../utils/imageHelper';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (product: Product) => void;
  productName: string;
}

const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  onSelect,
  productName 
}) => {
  if (!isOpen) return null;

  // Sort products by price to highlight the cheapest one
  const sortedProducts = [...products].sort((a, b) => a.price - b.price);
  const bestPrice = sortedProducts[0].price;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Compare Prices for <span className="text-emerald-600 capitalize">{productName}</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">We found multiple farmers selling this item. Choose the best deal for you!</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sortedProducts.map((product, index) => (
              <div 
                key={product.id}
                className={`relative group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  product.price === bestPrice 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-100 hover:border-emerald-200 bg-white'
                }`}
                onClick={() => {
                  onSelect(product);
                  onClose();
                }}
              >
                {product.price === bestPrice && (
                  <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Best Value
                  </div>
                )}
                
                <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                    <Leaf className="h-3 w-3" />
                    {product.farmerName}
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">(4.8)</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-black ${product.price === bestPrice ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ₹{product.price}
                  </div>
                  <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    Per {product.unit}
                  </div>
                  <button className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-2 transition-all">
                    Add to Cart <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Prices are set directly by farmers. All produce is organic and fresh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonModal;
