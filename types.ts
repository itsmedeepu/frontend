
export type Role = 'customer' | 'farmer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  farmName?: string;
  farmDescription?: string;
  location?: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  stock: number;
  farmerRating?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  farmerId: string;
  items: OrderItem[];
  total: number;
  totalAmount?: number; // Add this since it's used
  status: OrderStatus;
  date: string;
  createdAt?: string; // Add this since it's used
  review?: {
    rating: number;
    comment: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  farmer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    farmDetails?: {
      farmName: string;
    };
  };
}

export interface Transaction {
  id: string;
  orderId: string;
  farmerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}
