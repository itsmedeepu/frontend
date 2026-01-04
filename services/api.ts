import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Product, User } from '../types';
import { loadingEmitter } from '../context/LoadingContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''; 
const API_URL = `${BACKEND_URL}/api/v1/agridirect`;

const getAccessToken = () => localStorage.getItem('accessToken');

const setAccessToken = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('agri_user');
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    loadingEmitter.start();
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingEmitter.stop();
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    loadingEmitter.stop();
    return response;
  },
  async (error) => {
    loadingEmitter.stop();
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.get(`${API_URL}/user/refreshtoken`, {
          withCredentials: true,
        });

        if (refreshResponse.status === 200 && refreshResponse.data.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          setAccessToken(newAccessToken);
          
          if (refreshResponse.data.user) {
            localStorage.setItem('agri_user', JSON.stringify(refreshResponse.data.user));
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        clearTokens();
        window.location.href = '/#/login';
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  register: async (data: any) => {
    try {
      const response = await apiClient.post('/user/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/user/login', { email, password });
      const data = response.data;
      setAccessToken(data.accessToken);
      return data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  getProducts: async (params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; available?: string }): Promise<Product[]> => {
    try {
      const queryParams: any = {};
      if (params?.available) queryParams.available = params.available;
      else queryParams.available = 'true'; 

      if (params?.category && params.category !== 'All') queryParams.category = params.category;
      if (params?.search) queryParams.search = params.search;
      if (params?.minPrice) queryParams.minPrice = params.minPrice;
      if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;

      const response = await apiClient.get('/product/getproducts', { params: queryParams });
      const data = response.data;
      
      return data.products.map((p: any) => ({
        ...p,
        id: p._id,
        image: p.image && p.image.startsWith('/') 
          ? `${BACKEND_URL}${p.image}` 
          : p.image,
        farmerName: p.farmer?.farmDetails?.farmName || p.farmer?.name || 'Local Farmer',
        farmerId: p.farmer?._id || p.farmer,
        farmerRating: p.farmerRating
      })); 
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  createOrder: async (
    items: { product: string; quantity: number }[],
    paymentDetails?: { paymentMode?: string; paymentStatus?: string }
  ) => {
    try {
      const response = await apiClient.post('/order/create', { 
        items,
        ...(paymentDetails?.paymentMode && { paymentMode: paymentDetails.paymentMode }),
        ...(paymentDetails?.paymentStatus && { paymentStatus: paymentDetails.paymentStatus })
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  updateUserDetails: async (data: Partial<User>) => {
    try {
      const response = await apiClient.patch('/user/updateuser', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  },

  getOrders: async (status?: string) => {
    try {
      const query = status && status !== 'All' ? `?status=${status}` : '';
      const response = await apiClient.get(`/order/${query}`);
      const data = response.data;
      return data.orders.map((o: any) => ({
        ...o,
        id: o._id,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await apiClient.get(`/product/get/${id}`);
      const p = response.data.product;
      return {
        ...p,
        id: p._id,
        image: p.image && p.image.startsWith('/') 
          ? `${BACKEND_URL}${p.image}` 
          : p.image,
        farmerName: p.farmer?.farmDetails?.farmName || p.farmer?.name || 'Local Farmer',
        farmerId: p.farmer?._id || p.farmer
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  getFarms: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/user/farms'); 
      const data = response.data;
      return data.farms.map((f: any) => ({
        ...f,
        id: f._id,
        farmName: f.farmDetails?.farmName,
        farmDescription: f.farmDetails?.farmDescription,
        location: f.farmDetails?.location || f.location
      }));
    } catch (error) {
      console.error('Error fetching farms:', error);
      return [];
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/transaction/transactions');
      return response.data.transactions;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  updateOrderStatus: async (id: string, status: string, deliveryDetails?: any, cancellationReason?: string) => {
    try {
      const response = await apiClient.patch(`/order/${id}/status`, { status, deliveryDetails, cancellationReason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  createProduct: async (productData: any) => {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.post('/product/create', productData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.patch(`/product/update/${id}`, productData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await apiClient.delete(`/product/delete/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  updateFarmDetails: async (data: any) => {
    try {
      const response = await apiClient.patch('/user/updatefarm', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  },

  cancelOrder: async (id: string) => {
    try {
      const response = await apiClient.patch(`/order/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  addReview: async (reviewData: { orderId: string; farmerId: string; rating: number; comment: string }) => {
    try {
      const response = await apiClient.post('/review/add', reviewData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },

  getReviews: async (farmerId: string) => {
    try {
      const response = await apiClient.get(`/review/${farmerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get reviews');
    }
  },

  getAllReviews: async () => {
    try {
      const response = await apiClient.get('/review/all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get all reviews');
    }
  },

  getChatHistory: async (orderId: string) => {
    try {
      const response = await apiClient.get(`/chat/history/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get chat history');
    }
  },

  getActiveConversations: async () => {
    try {
      const response = await apiClient.get('/chat/conversations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get active conversations');
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/user/forgotpassword', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  },

  resetPasswordWithToken: async (token: string, password: string) => {
    try {
      const response = await apiClient.post(`/user/resetpassword/${token}`, { password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  changePassword: async (passwordData: any) => {
    try {
      const response = await apiClient.post('/user/resetpassword', passwordData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },
};
