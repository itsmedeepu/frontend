import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const addToCart = (product: Product) => {
    if (!product || !product.id) {
        console.error('CartContext: Attempted to add invalid product', product);
        showToast('Error: Invalid product data', 'error');
        return;
    }

    if (product.stock <= 0) {
        showToast('Product is out of stock', 'error');
        return;
    }

    const existing = items.find(item => item.id === product.id);

    if (existing) {
        if (existing.quantity >= product.stock) {
            showToast(`Cannot add more. Max stock available: ${product.stock}`, 'error');
            return;
        }
        showToast(`${product.name} added to cart`, 'success'); 
        setItems(prev => prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          ));
    } else {
        showToast(`${product.name} added to cart`, 'success');
        setItems(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    console.log('CartContext: Removing', productId);
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log('CartContext: Updating quantity', { productId, quantity });
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prev => prev.map(item => {
        if (item.id === productId) {
             if (quantity > item.stock) {
                 showToast(`Only ${item.stock} items available`, 'error');
                 return { ...item, quantity: item.stock };
             }
             return { ...item, quantity: Number(quantity) };
        }
        return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const toggleCart = () => setIsOpen(prev => !prev);

  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      isOpen, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      toggleCart,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
