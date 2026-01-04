
export type Role = 'customer' | 'farmer';

export interface Address {
  doorNo?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

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
  address?: string | Address;
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
  unitPrice?: number;
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
  _id: string; 
  id: string;
  customerId: string;
  customerName: string;
  farmerId: string;
  items: any[]; 
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
    address?: string | Address;
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
  shippingAddress?: Address;
}

export interface Transaction {
  id: string;
  orderId: string;
  farmerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}
