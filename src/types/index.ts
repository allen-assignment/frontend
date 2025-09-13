// Customer side types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;
}

export interface Category {
  category_id: string;
  category_name: string;
}

// Merchant side types
export type TabType = 'dashboard' | 'menu' | 'addMenu' | 'ocr' | 'members';

export interface MerchantMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  isAvailable: boolean;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
} 