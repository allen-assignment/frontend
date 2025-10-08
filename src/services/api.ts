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


// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  // Get user info by ID
  getUserById: async (userId: number) => {
    const response = await api.get(`/user/getUserById?user_id=${userId}`);
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
    merchant_id: number;
    category_name: string;
    description?: string;
  }) => {
    const response = await api.post('/menu/category/add/', categoryData);
    return response.data;
  },

  // Add menu item (supports file upload)
  addMenuItem: async (itemData: {
    category_id: number;
    name: string;
    price: number;
    inventory: number;
    description?: string;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append('category_id', String(itemData.category_id));
    formData.append('name', String(itemData.name));
    formData.append('price', String(itemData.price));
    formData.append('inventory', String(itemData.inventory));
    if (itemData.description != null) formData.append('description', String(itemData.description));
    if (itemData.file) formData.append('file', itemData.file);

    const response = await api.post('/menu/item/add/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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

  // Get all menu items
  getAllMenuItems: async (merchantId: number): Promise<{ menuItems: MenuItem[] }> => {
    const response = await api.get(`/menu/items/?merchant=${merchantId}`);
    return response.data;
  },
};

// Order related API
export const orderAPI = {
  // Create order
  createOrder: async (orderData: {
    merchant_id: number;
    user_id: number;
    table_number: string;
    items: OrderItem[];
  }) => {
    const response = await api.post('/order/create/', orderData);
    return response.data;
  },

  // Get merchant order list
  getOrders: async (merchant_id: number): Promise<{ orders: Order[] }> => {
    const response = await api.get(`/order/getOrders/?merchant_id=${merchant_id}`);
    return response.data;
  },

  // Get user order history
  getUserOrders: async (user_id: number, merchant_id: number): Promise<{ orders: Order[] }> => {
    const response = await api.get(`/order/getOrders/?user_id=${user_id}&merchant_id=${merchant_id}`);
    return response.data;
  },

  // Update order status (cancel or pay)
  updateOrderStatus: async (orderData: {
    merchant_id: number;
    order_id: number;
    status?: number;
  }) => {
    const response = await api.post('/order/statuschanged/', orderData);
    return response.data;
  },

  // Cancel order (maintain backward compatibility)
  cancelOrder: async (orderId: number, merchantId: number) => {
    const response = await api.post('/order/statuschanged/', { 
      order_id: orderId,
      merchant_id: merchantId,
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
    merchant_id: number;
    preview_id?: string;
    items?: OCRMenuItem[];
  }) => {
    const response = await api.post('/menu/ocr/import/', importData);
    return response.data;
  },
};

export default api;