import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { menuData } from '../../data/menuData';

// 共享的数据类型定义
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;
  isAvailable?: boolean;
  ingredients?: string[];
  inventory?: number;
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
  email: string;
  usertype: number; // 1: customer, 2: merchant
}

export interface Order {
  id: string;
  tableNumber: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
  }[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  total: number;
  createdAt: string;
}

// 应用状态接口
interface AppState {
  menuItems: MenuItem[];
  members: Member[];
  orders: Order[];
  currentTable: string | null;
  isConnected: boolean;
  currentUser: User | null;
  isLoggedIn: boolean;
}

// 动作类型
type AppAction =
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'SET_CURRENT_TABLE'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

// 初始状态
const initialState: AppState = {
  menuItems: menuData,
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
  isLoggedIn: false
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
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
        isLoggedIn: true 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        currentUser: null, 
        isLoggedIn: false 
      };
    default:
      return state;
  }
}

// 上下文接口
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便捷方法
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addOrder: (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setCurrentTable: (tableNumber: string) => void;
  login: (user: User) => void;
  logout: () => void;
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便捷方法
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

  const addOrder = (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      tableNumber,
      items,
      status: 'pending',
      total: items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_ORDER', payload: newOrder });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
  };

  const setCurrentTable = (tableNumber: string) => {
    dispatch({ type: 'SET_CURRENT_TABLE', payload: tableNumber });
  };

  const login = (user: User) => {
    console.log('Login function called with user:', user);
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addOrder,
    updateOrderStatus,
    setCurrentTable,
    login,
    logout
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