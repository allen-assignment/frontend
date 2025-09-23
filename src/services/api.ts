import axios from 'axios';

// API基础配置
const API_BASE_URL = 'http://localhost:8000';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  birth_date: string;
  usertype: number;
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
  price: number;
  inventory: number;
  category: {
    id: number;
    name: string;
  };
  description: string;
}

export interface OrderItem {
  item_id: number;
  quantity: number;
}

export interface Order {
  order_id: number;
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

// OCR相关类型定义
export interface OCRMenuItem {
  name: string;
  price: number;
  description?: string;
  category?: string;
  tags?: string[];
  confidence?: number;
}

export interface OCRResponse {
  ok: boolean;
  mode: string;
  items: OCRMenuItem[];
  error?: string;
}

// 用户相关API
export const userAPI = {
  // 用户注册
  register: async (userData: {
    username: string;
    password: string;
    email?: string;
    birth_date?: string;
    usertype?: number;
  }) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },

  // 用户登录
  login: async (credentials: {
    username: string;
    password: string;
  }) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  // 根据ID获取用户信息
  getUserById: async (userId: number) => {
    const response = await api.get(`/user/getUserById?user_id=${userId}`);
    return response.data;
  },
};

// 菜单相关API
export const menuAPI = {
  // 添加菜单分类
  addCategory: async (categoryData: {
    category_name: string;
    description?: string;
  }) => {
    const response = await api.post('/menu/category/add/', categoryData);
    return response.data;
  },

  // 添加菜单项
  addMenuItem: async (itemData: {
    category_id: number;
    image_url: string;
    name: string;
    price: number;
    inventory: number;
    description?: string;
  }) => {
    const response = await api.post('/menu/item/add/', itemData);
    return response.data;
  },

  // 获取所有菜单项
  getAllMenuItems: async (): Promise<{ menuItems: MenuItem[] }> => {
    const response = await api.get('/menu/items/');
    return response.data;
  },

  // 获取所有分类（从菜单项中提取）
  getAllCategories: async (): Promise<{ categories: { id: number; name: string; description: string }[] }> => {
    const response = await api.get('/menu/items/');
    const menuItems = response.data.menuItems;
    
    // 从菜单项中提取唯一的分类
    const categoryMap = new Map();
    menuItems.forEach((item: MenuItem) => {
      if (item.category && !categoryMap.has(item.category.id)) {
        categoryMap.set(item.category.id, {
          id: item.category.id,
          name: item.category.name,
          description: '' // 菜单API中没有分类描述
        });
      }
    });
    
    return { categories: Array.from(categoryMap.values()) };
  },
};

// 订单相关API
export const orderAPI = {
  // 创建订单
  createOrder: async (orderData: {
    user_id: number;
    table_number: string;
    items: OrderItem[];
  }) => {
    const response = await api.post('/order/create/', orderData);
    return response.data;
  },

  // 获取订单列表
  getOrders: async (userId?: number): Promise<{ orders: Order[] }> => {
    const url = userId ? `/order/getOrders/?user_id=${userId}` : '/order/getOrders/';
    const response = await api.get(url);
    return response.data;
  },

  // 取消订单
  cancelOrder: async (orderId: number) => {
    const response = await api.post('/order/cancel/', { order_id: orderId });
    return response.data;
  },
};

// OCR相关API - 使用新的backend OCR端点
export const ocrAPI = {

  // // 处理图片OCR识别
  // processImage: async (imageData: string) => {
  //   const response = await api.post('/ocr/process/', {
  //     image: imageData



  // 上传菜单图片进行OCR识别
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

  // // 获取可用的OCR提供商
  // getProviders: async () => {
  //   const response = await api.get('/ocr/providers/');
  //   return response.data;
  // },

  // 上传菜单图片并获取CSV格式结果
  uploadMenuImageAsCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/menu/ocr/upload/?format=csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // 用于下载CSV文件
    });
    return response.data;
  },
};

export default api;