import { Product, User, Order, Transaction, OrderStatus } from '../types';

// Initial Mock Data
let PRODUCTS: Product[] = [
  {
    id: 'p1',
    farmerId: 'f1',
    farmerName: 'Green Valley Farm',
    name: 'Organic Red Tomatoes',
    description: 'Freshly picked vine-ripened organic tomatoes. No pesticides used.',
    price: 3.50,
    unit: 'kg',
    category: 'Vegetables',
    image: 'https://picsum.photos/seed/tomato/600/400',
    stock: 50
  },
  {
    id: 'p2',
    farmerId: 'f2',
    farmerName: 'Sunrise Orchards',
    name: 'Honeycrisp Apples',
    description: 'Crisp, sweet, and juicy apples from our heritage orchard.',
    price: 4.99,
    unit: 'kg',
    category: 'Fruits',
    image: 'https://picsum.photos/seed/apple/600/400',
    stock: 120
  }
];

let ORDERS: Order[] = [
  {
    id: 'ord1',
    customerId: 'u1',
    customerName: 'John Doe',
    farmerId: 'f1',
    items: [{ productId: 'p1', name: 'Organic Red Tomatoes', price: 3.50, quantity: 2, unit: 'kg' }],
    total: 7.00,
    status: 'delivered',
    date: '2023-11-20'
  }
];

let TRANSACTIONS: Transaction[] = [
  {
    id: 'tr1',
    orderId: 'ord1',
    farmerId: 'f1',
    amount: 7.00,
    status: 'completed',
    date: '2023-11-20'
  }
];

let FARMS: User[] = [
  { id: 'f1', name: 'Alice Farmer', email: 'alice@farm.com', role: 'farmer', farmName: 'Green Valley Farm', farmDescription: 'Specializing in organic heirlooms.', location: 'California' },
  { id: 'f2', name: 'Bob Farmer', email: 'bob@farm.com', role: 'farmer', farmName: 'Sunrise Orchards', farmDescription: 'Fruit trees and honey.', location: 'Oregon' },
];

export const mockApi = {
  // User Routes
  getFarms: async () => FARMS,
  getUserDetails: async (id: string) => FARMS.find(f => f.id === id) || { id, name: 'John Doe', email: 'john@example.com', role: 'customer' as const },
  updateUserDetails: async (id: string, updates: Partial<User>) => {
    // In a real app, this updates the DB. Here we simulate success.
    console.log(`Updating user ${id} with:`, updates);
    return { ...updates, id };
  },
  updateFarmDetails: async (id: string, updates: Partial<User>) => {
    FARMS = FARMS.map(f => f.id === id ? { ...f, ...updates } : f);
    return FARMS.find(f => f.id === id);
  },
  resetPassword: async (userId: string) => ({ success: true, message: 'Password reset successful' }),
  
  // Product Routes
  getProducts: async () => PRODUCTS,
  getProductById: async (id: string) => PRODUCTS.find(p => p.id === id),
  createProduct: async (product: Partial<Product>) => {
    const newProduct = { 
      ...product, 
      id: `p${Date.now()}`,
      image: product.image || `https://picsum.photos/seed/${Date.now()}/600/400`
    } as Product;
    PRODUCTS.push(newProduct);
    return newProduct;
  },
  updateProduct: async (id: string, updates: Partial<Product>) => {
    PRODUCTS = PRODUCTS.map(p => p.id === id ? { ...p, ...updates } : p);
    return PRODUCTS.find(p => p.id === id);
  },
  deleteProduct: async (id: string) => {
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    return { success: true };
  },

  // Order Routes
  createOrder: async (orderData: Partial<Order>) => {
    const newOrder = { 
      ...orderData, 
      id: `ord${Date.now()}`, 
      date: new Date().toISOString().split('T')[0],
      status: 'pending' 
    } as Order;
    ORDERS.push(newOrder);
    return newOrder;
  },
  getOrders: async (userId: string, role: 'customer' | 'farmer') => {
    if (role === 'farmer') return ORDERS.filter(o => o.farmerId === userId);
    return ORDERS.filter(o => o.customerId === userId);
  },
  getOrderById: async (id: string) => ORDERS.find(o => o.id === id),
  updateOrderStatus: async (id: string, status: OrderStatus) => {
    ORDERS = ORDERS.map(o => o.id === id ? { ...o, status } : o);
    return ORDERS.find(o => o.id === id);
  },
  cancelOrder: async (id: string) => {
    ORDERS = ORDERS.map(o => o.id === id ? { ...o, status: 'cancelled' as OrderStatus } : o);
    return { success: true };
  },

  // Transaction Routes
  getTransactions: async (farmerId: string) => TRANSACTIONS.filter(t => t.farmerId === farmerId),
  getTransactionById: async (id: string) => TRANSACTIONS.find(t => t.id === id),
  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    TRANSACTIONS = TRANSACTIONS.map(t => t.id === id ? { ...t, ...updates } : t);
    return TRANSACTIONS.find(t => t.id === id);
  },
  deleteTransaction: async (id: string) => {
    TRANSACTIONS = TRANSACTIONS.filter(t => t.id !== id);
    return { success: true };
  }
};