import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { tokenManager, menuAPI } from '../../services/api';

// Shared data type definitions
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;
  category?: {
    id: number;
    name: string;
  };
  merchant_id?: number;  // Merchant ID - used for identifying merchant when placing orders
  isAvailable?: boolean;
  inventory?: number;
  feature_one?: string;
  feature_two?: string;
  feature_three?: string;
  // Recommended items specific fields
  searchScore?: number;
  tags?: string;
  restaurantId?: string;
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

export interface User {
  id: string;
  username: string;
  birth_date: string;
  email: string;
  usertype: number; // 0: merchant, 1: customer
  taste_preferences?: string;
  merchant_id?: number; // Merchant ID, only valid for merchant users
  merchant_name?: string; // Merchant name, only valid for merchant users
}

export interface Order {
  id: string;
  tableNumber: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
  status: string | number; // Backend returns string: "paid" / "cancelled", or number: 0 / 1
  total: number;
  createdAt: string;
}

// Category interface
export interface Category {
  id: number;
  name: string;
}

// Application state interface
interface AppState {
  menuItems: MenuItem[];
  members: Member[];
  orders: Order[];
  categories: Category[];
  currentTable: string | null;
  isConnected: boolean;
  currentUser: User | null;
  isLoggedIn: boolean;
  recommendedItems: MenuItem[];
  isRecommendationsLoaded: boolean;
  isMenuDataLoaded: boolean;
  isCategoriesLoaded: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'SET_CURRENT_TABLE'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_RECOMMENDED_ITEMS'; payload: MenuItem[] }
  | { type: 'SET_RECOMMENDATIONS_LOADED'; payload: boolean }
  | { type: 'SET_MENU_DATA_LOADED'; payload: boolean }
  | { type: 'SET_CATEGORIES_LOADED'; payload: boolean }
  | { type: 'SET_ORDERS'; payload: Order[] };

// Initial state
const initialState: AppState = {
  menuItems: [], // Initially empty, get data from API
  categories: [], // Initially empty, get data from API
  members: [
    {
      id: '1',
      name: 'John Smith',
      phone: '138****1234',
      email: 'john@example.com',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 856
    },
    {
      id: '2',
      name: 'Jane Doe',
      phone: '139****5678',
      email: 'jane@example.com',
      joinDate: '2024-02-20',
      totalOrders: 8,
      totalSpent: 624
    }
  ],
  orders: [],
  currentTable: null,
  isConnected: true,
  currentUser: null,
  isLoggedIn: false,
  // Recommended items
  recommendedItems: [],
  isRecommendationsLoaded: false,
  // Data loading status
  isMenuDataLoaded: false,
  isCategoriesLoaded: false
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload, isMenuDataLoaded: true };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, action.payload] };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.payload)
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, isCategoriesLoaded: true };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.payload.id ? action.payload : member
        )
      };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    case 'SET_CURRENT_TABLE':
      return { ...state, currentTable: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'LOGIN':
      console.log('LOGIN reducer called with payload:', action.payload);
      return { 
        ...state, 
        currentUser: action.payload, 
        isLoggedIn: true,
        // Clear all data when switching users
        menuItems: [], // Clear menu data
        orders: [], // Clear order data
        categories: [], // Clear category data
        recommendedItems: [], // Clear recommendation data
        isMenuDataLoaded: false, // Reset menu data loading status
        isCategoriesLoaded: false, // Reset category data loading status
        isRecommendationsLoaded: false // Reset recommendation data loading status
      };
    case 'SET_USER':
      console.log('SET_USER reducer called with payload:', action.payload);
      return {
        ...state,
        currentUser: action.payload
      };
    case 'LOGOUT':
      console.log('LOGOUT reducer called, current state:', state);
      const newState = { 
        ...state, 
        currentUser: null, 
        isLoggedIn: false,
        // Clear all data on logout
        menuItems: [],
        orders: [],
        categories: [],
        recommendedItems: [],
        isMenuDataLoaded: false,
        isCategoriesLoaded: false,
        isRecommendationsLoaded: false
      };
      console.log('LOGOUT reducer completed, new state:', newState);
      return newState;
    case 'SET_RECOMMENDED_ITEMS':
      return { ...state, recommendedItems: action.payload };
    case 'SET_RECOMMENDATIONS_LOADED':
      return { ...state, isRecommendationsLoaded: action.payload };
    case 'SET_MENU_DATA_LOADED':
      return { ...state, isMenuDataLoaded: action.payload };
    case 'SET_CATEGORIES_LOADED':
      return { ...state, isCategoriesLoaded: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setCategoriesLoaded: (loaded: boolean) => void;
  loadCategories: () => Promise<void>;
  addOrder: (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setCurrentTable: (tableNumber: string) => void;
  login: (user: User) => void;
  logout: () => void;
  setRecommendedItems: (items: MenuItem[]) => void;
  loadRecommendations: (tastePreferences: string, restaurantId?: string, topK?: number) => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize login state from token on app start
  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      try {
        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.user_id.toString(),
          username: payload.username || 'User',
          email: payload.email || '',
          merchant_id: payload.merchant_id,
          merchant_name: payload.merchant_name || '',
          usertype: payload.user_type
        };
        console.log('Auto-login from token:', user);
        dispatch({ type: 'LOGIN', payload: user });
      } catch (error) {
        console.error('Failed to decode token:', error);
        tokenManager.removeToken();
      }
    }
  }, []);

  // Convenience methods
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString()
    };
    dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
  };

  const updateMenuItem = (item: MenuItem) => {
    dispatch({ type: 'UPDATE_MENU_ITEM', payload: item });
  };

  const deleteMenuItem = (id: string) => {
    dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
  };

  const setCategories = (categories: Category[]) => {
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  };

  const setCategoriesLoaded = (loaded: boolean) => {
    dispatch({ type: 'SET_CATEGORIES_LOADED', payload: loaded });
  };

  const loadCategories = async () => {
    try {
      console.log('=== AppContext loadCategories ===');
      console.log('Current categories:', state.categories);
      
      const response = await menuAPI.getCategories();
      console.log('Categories API response:', response);
      
      // Convert MenuCategory to Category format
      const convertedCategories = response.categories.map(cat => ({
        id: cat.id,
        name: cat.category_name,
        description: cat.description || ''
      }));
      
      console.log('Converted categories:', convertedCategories);
      setCategories(convertedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const addOrder = (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      tableNumber,
      items,
      status: 0, // 0: Paid (default status for new order)
      total: items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_ORDER', payload: newOrder });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Convert string status to number for API call
      let statusNumber: number | undefined;
      if (typeof status === 'string') {
        statusNumber = status === 'paid' ? 0 : status === 'cancelled' ? 1 : undefined;
      } else {
        statusNumber = status;
      }
      
      // Call API to update order status
      const { orderAPI } = await import('../../services/api');
      await orderAPI.updateOrderStatus({
        order_id: parseInt(orderId),
        status: statusNumber // 0: Paid, 1: Cancelled
      });
      
      // Update local state
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const setCurrentTable = (tableNumber: string) => {
    dispatch({ type: 'SET_CURRENT_TABLE', payload: tableNumber });
  };

  const login = (user: User) => {
    console.log('Login function called with user:', user);
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    console.log('Logout function called');
    // Use tokenManager to remove JWT token
    tokenManager.removeToken();
    console.log('JWT token removed from localStorage');
    dispatch({ type: 'LOGOUT' });
    console.log('Logout dispatch executed');
  };

  const setRecommendedItems = (items: MenuItem[]) => {
    dispatch({ type: 'SET_RECOMMENDED_ITEMS', payload: items });
  };

  const loadRecommendations = async (tastePreferences: string, restaurantId: string = '1', topK: number = 5) => {
    try {
      dispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: false });
      
      // Check if menu data already exists, if not load first
      if (!state.isMenuDataLoaded || state.menuItems.length === 0) {
        console.log('Menu data not loaded, loading menu data first...');
        const { menuAPI } = await import('../../services/api');
        const menuResponse = await menuAPI.getAllMenuItems(parseInt(restaurantId));
        // Convert API data format to match AppContext MenuItem interface
        const convertedMenuItems: MenuItem[] = menuResponse.menuItems.map(item => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price),
          image_url: item.image_url,
          category_id: item.category.id.toString(),
          category: item.category,
          merchant_id: item.merchant_id,  // Keep merchant_id
          isAvailable: true,
          inventory: item.inventory,
          feature_one: item.feature_one,
          feature_two: item.feature_two,
          feature_three: item.feature_three
        }));
        dispatch({ type: 'SET_MENU_ITEMS', payload: convertedMenuItems });
      }
      
      // Import userAPI
      const { userAPI } = await import('../../services/api');
      
      console.log('Vector Search API call parameters:', {
        text: tastePreferences,
        restaurant_id: restaurantId,
        top_k: topK
      });
      
      const response = await userAPI.vectorSearch({
        text: tastePreferences,
        restaurant_id: restaurantId,
        top_k: topK
      });
      
      console.log('Vector API raw response data:', response);
      console.log('Search results details:', response.value);
      
      // Directly find matching items from existing menu data
      const recommendedItems: MenuItem[] = response.value?.map((item: any) => {
        // Direct ID matching - simplest and most efficient way
        const matchedMenuItem = state.menuItems.find(menuItem => 
          menuItem.id.toString() === item.id
        );
        
        if (matchedMenuItem) {
          console.log(`Directly matched menu item: "${item.name}" (ID: ${item.id})`);
          return {
            ...matchedMenuItem,
            searchScore: item['@search.score'],
            tags: item.text?.match(/tags:\s*([^|]+)/i)?.[1]?.trim() || '',
            restaurantId: item.restaurant_id
          };
        }
        
        // If ID matching fails, try name matching
        const vectorName = item.name?.toLowerCase().trim();
        const nameMatchedItem = state.menuItems.find(menuItem => 
          menuItem.name.toLowerCase().trim() === vectorName
        );
        
        if (nameMatchedItem) {
          console.log(`Matched menu item by name: "${item.name}" -> "${nameMatchedItem.name}"`);
          return {
            ...nameMatchedItem,
            searchScore: item['@search.score'],
            tags: item.text?.match(/tags:\s*([^|]+)/i)?.[1]?.trim() || '',
            restaurantId: item.restaurant_id,
            isAvailable: true // Ensure recommended items are available
          };
        }
        
        // If no match found, log debug info
        console.log(`No menu item matched: "${item.name}" (ID: ${item.id})`);
        console.log(`Current menu items count: ${state.menuItems.length}`);
        console.log(`Menu item ID list:`, state.menuItems.map(m => m.id));
        
        return null; // Return null, will be filtered out later
      }).filter(Boolean) || []; // Filter out null values
      
      console.log('Final recommended items list:', recommendedItems);
      
      dispatch({ type: 'SET_RECOMMENDED_ITEMS', payload: recommendedItems });
      dispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: true });
      
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      dispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: true });
    }
  };

  const value: AppContextType = {
    state,
    dispatch,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setCategories,
    setCategoriesLoaded,
    loadCategories,
    addOrder,
    updateOrderStatus,
    setCurrentTable,
    login,
    logout,
    setRecommendedItems,
    loadRecommendations
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook for using context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};