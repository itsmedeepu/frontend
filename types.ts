
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

export interface Delivery {
  _id: string;
  order: string;
  carrierName: string;
  trackingId?: string;
  phone?: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
  shippedDate?: string;
  deliveredDate?: string;
  address?: string;
  customerContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string; // Add _id for MongoDB compatibility
  id: string;
  customerId: string;
  customerName: string;
  farmerId: string;
  items: any[]; // Relaxed for now as we use populate
  total: number;
  totalAmount?: number;
  status: OrderStatus;
  date: string;
  createdAt: string;
  delivery?: Delivery;
  review?: {
    rating: number;
    comment: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
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
