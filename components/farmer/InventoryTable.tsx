import React, { useState } from 'react';
import { Search, Plus, Edit2 } from 'lucide-react';
import { Product } from '../../types';
import { getImageUrl } from '../../utils/imageHelper';

interface InventoryTableProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleAvailability: (id: string, currentStatus: boolean) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onToggleAvailability 
}) => {
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryAvailability, setInventoryAvailability] = useState<'true' | 'false' | 'all'>('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesAvailability = 
      inventoryAvailability === 'all' || 
      (inventoryAvailability === 'true' && p.available) || 
      (inventoryAvailability === 'false' && !p.available);
    return matchesSearch && matchesAvailability;
  });

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
            onClick={onAddProduct}
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
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(p.image)} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
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
                      onClick={() => onToggleAvailability(p.id, p.available)}
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
                    <button onClick={() => onEditProduct(p)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
