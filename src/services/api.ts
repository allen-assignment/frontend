import axios from 'axios';

// API base configuration
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added');
    } else {
      console.warn('No token found, skipping Authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    console.error('API Error URL:', error.config?.url);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      console.log('401 error:', {
        requestUrl,
        currentPath: window.location.pathname,
        errorMessage: error.response?.data || error.message
      });
      
      // If it's a login or register API 401, don't auto redirect (let page handle error)
      if (requestUrl.includes('/user/login') || requestUrl.includes('/user/register')) {
        console.log('Login/register failed, let page handle error');
        return Promise.reject(error);
      }
      
      // Token expired or invalid, remove it and redirect to login
      console.log('Token expired or invalid, redirecting to login');
      localStorage.removeItem('jwt_token');
      
      // Redirect to appropriate login page based on current path
      const currentPath = window.location.pathname;
      if (currentPath.includes('/merchant')) {
        console.log('Redirecting to merchant login page');
        window.location.href = '/merchant/login';
      } else {
        console.log('Redirecting to customer login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Type definitions
export interface User {
  user_id: number;
  username: string;
  email: string;
  birth_date: string;
  usertype: number;
  taste_preferences?: string;
}

export interface MenuCategory {
  id: number;
  category_name: string;
  description: string;
}

export interface MenuItem {
  id: number;
  name: string;
  image_url: string;
  price: string;
  inventory: number;
  isAvailable?: boolean;
  category: {
    id: number;
    name: string;
  };
  merchant_id: number;
  description?: string;
  feature_one?: string;
  feature_two?: string;
  feature_three?: string;
}

export interface OrderItem {
  item_id: number;
  quantity: number;
}

export interface Order {
  order_id: number;
  merchant_id: number;
  user_id: number;
  user_name: string;
  table_number: string;
  status: string;
  total_price: number;
  order_time: string;
  items: {
    item_id: number;
    name: string;
    quantity: number;
    item_price: number;
    subtotal: number;
  }[];
}

// OCR related type definitions
export interface OCRMenuItem {
  name: string;
  price: number | string; // Support both number and string for API compatibility
  description?: string;
  category?: string;
  tags?: string[];
  confidence?: number;
}

export interface OCRResponse {
  preview_id: string;
  items: OCRMenuItem[];
  error?: string;
}

// JWT Token management
export const tokenManager = {
  // Store JWT token in localStorage
  setToken: (token: string) => {
    localStorage.setItem('jwt_token', token);
  },

  // Get JWT token from localStorage
  getToken: () => {
    return localStorage.getItem('jwt_token');
  },

  // Remove JWT token from localStorage
  removeToken: () => {
    localStorage.removeItem('jwt_token');
  },

  // Decode JWT token to get user info
  decodeToken: async (token: string) => {
    const response = await api.post('/user/decode', { token });
    return response.data;
  }
};

// User related API
export const userAPI = {
  // User registration
  register: async (userData: {
    username: string;
    password: string;
    email?: string;
    birth_date?: string;
    usertype?: number;
    merchantName?: string;
    tastePreferences?: string;
  }) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },

  // User login
  login: async (credentials: {
    username: string;
    password: string;
  }) => {
    console.log('userAPI.login starting request:', credentials);
    try {
      const response = await api.post('/user/login', credentials);
      console.log('userAPI.login request successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('userAPI.login request failed:', error);
      throw error;
    }
  },

  // Get user info by ID (from token)
  getUserById: async () => {
    const response = await api.get(`/user/getUserById`);
    return response.data;
  },

  // Vector search
  vectorSearch: async (searchData: {
    text: string;
    top_k?: number;
    restaurant_id?: string;
  }) => {
    const response = await api.post('/user/vector-search', searchData);
    return response.data;
  },
};

// Menu related API
export const menuAPI = {
  // Add menu category
  addCategory: async (categoryData: {
    category_name: string;
    description?: string;
  }) => {
    const response = await api.post('/menu/category/add/', categoryData);
    return response.data;
  },

  // Add menu item (supports file upload via multipart/form-data)
  addMenuItem: async (itemData: {
    category_id: number;
    name: string;
    price: number;
    inventory: number;
    isAvailable: boolean;  // Required field
    description?: string;
    file?: File;  // File is now optional
  }) => {
    // Create FormData object
    const formData = new FormData();
    formData.append('category_id', itemData.category_id.toString());
    formData.append('name', itemData.name);
    formData.append('price', itemData.price.toString());
    formData.append('inventory', itemData.inventory.toString());
    
    if (itemData.description) {
      formData.append('description', itemData.description);
    }
    
    // isAvailable: '1' = true, '0' = false (required field)
    formData.append('isAvailable', itemData.isAvailable ? '1' : '0');
    
    // Add file (optional)
    if (itemData.file) {
      formData.append('file', itemData.file);
    }
    
    // Send request using multipart/form-data
    const response = await api.post('/menu/item/add/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update menu item (supports file upload)
  updateMenuItem: async (itemData: {
    id?: number;
    item_id?: number;
    name?: string;
    price?: number;
    inventory?: number;
    description?: string;
    category_id?: number;
    isAvailable?: number;
    file?: File;
  }) => {
    const formData = new FormData();
    if (itemData.id != null) formData.append('id', String(itemData.id));
    if (itemData.item_id != null) formData.append('item_id', String(itemData.item_id));
    if (itemData.name != null) formData.append('name', String(itemData.name));
    if (itemData.price != null) formData.append('price', String(itemData.price));
    if (itemData.inventory != null) formData.append('inventory', String(itemData.inventory));
    if (itemData.description != null) formData.append('description', String(itemData.description));
    if (itemData.category_id != null) formData.append('category_id', String(itemData.category_id));
    if (itemData.isAvailable != null) formData.append('isAvailable', String(itemData.isAvailable));
    if (itemData.file) formData.append('file', itemData.file);

    const response = await api.post('/menu/item/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; 
  },

  // Delete menu item
  deleteMenuItem: async (itemData: {
    id?: number;
    item_id?: number;
  }) => {
    const response = await api.post('/menu/item/delete/', itemData);
    return response.data;
  },

  // Get all menu items (merchant_id from token for merchants, or can pass merchantId for customers)
  getAllMenuItems: async (merchantId?: number): Promise<{ menuItems: MenuItem[] }> => {
    // If merchantId is provided, use it (for customer viewing specific merchant's menu)
    // If not provided, backend will get merchant_id from token (for merchant users)
    const url = merchantId ? `/menu/items/?merchant_id=${merchantId}` : '/menu/items/';
    const response = await api.get(url);
    return response.data;
  },
};

// Order related API
export const orderAPI = {
  // Create order
  createOrder: async (orderData: {
    table_number: string;
    items: OrderItem[];
  }) => {
    const response = await api.post('/order/create/', orderData);
    return response.data;
  },

  // Get orders (user_id or merchant_id from token)
  // For merchant: returns all orders for their merchant_id
  // For customer: returns all orders for their user_id
  getOrders: async (): Promise<{ orders: Order[] }> => {
    const response = await api.get('/order/getOrders/');
    return response.data;
  },

  // Alias for backward compatibility
  getUserOrders: async (): Promise<{ orders: Order[] }> => {
    const response = await api.get('/order/getOrders/');
    return response.data;
  },

  // Get single order by order_id
  getOrderById: async (orderId: number): Promise<{ order: Order }> => {
    const response = await api.get(`/order/getOrders/?order_id=${orderId}`);
    return response.data;
  },

  // Update order status (cancel or pay)
  updateOrderStatus: async (orderData: {
    order_id: number;
    status?: number;
  }) => {
    const response = await api.post('/order/statuschanged/', orderData);
    return response.data;
  },

  // Cancel order (maintain backward compatibility)
  cancelOrder: async (orderId: number) => {
    const response = await api.post('/order/statuschanged/', { 
      order_id: orderId,
      status: 1
    });
    return response.data;
  },
};

// OCR related API - menu recognition interface
export const ocrAPI = {
  // Upload menu image for OCR recognition
  uploadMenuImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/menu/ocr/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Import OCR recognized menu items to database
  importOCRItems: async (importData: {
    preview_id?: string;
    items?: OCRMenuItem[];
  }) => {
    const response = await api.post('/menu/ocr/import/', importData);
    return response.data;
  },
};

export default api;