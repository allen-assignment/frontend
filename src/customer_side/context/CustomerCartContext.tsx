import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem } from '../../shared/context/AppContext';

// Define the cart item structure (extends MenuItem with quantity)
export interface CartItem extends MenuItem {
    quantity: number;
}

// Define the cart state structure
interface CartState {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}

// Define the cart context structure
interface CartContextType {
    state: CartState;
    addToCart: (item: MenuItem, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    placeOrder: (addOrder: (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => void, currentTable: string | null) => void;
}

// Define the actions for the reducer
type CartAction =
    | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity?: number } }
    | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

// Create the initial cart state
const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
};

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    return { totalItems, totalPrice };
};

// Create the cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { item, quantity = 1 } = action.payload;
            
            // Check if the item already exists in the cart
            const existingItemIndex = state.items.findIndex(
                (cartItem) => cartItem.id === item.id
            );

            let updatedItems: CartItem[];

            if (existingItemIndex >= 0) {
                // If item exists, update its quantity
                updatedItems = state.items.map((cartItem, index) =>
                    index === existingItemIndex
                        ? {
                            ...cartItem,
                            quantity: cartItem.quantity + quantity,
                        }
                        : cartItem
                );
            } else {
                // If item doesn't exist, add it to the cart
                updatedItems = [
                    ...state.items,
                    { ...item, quantity },
                ];
            }

            // Calculate new totals
            const { totalItems, totalPrice } = calculateTotals(updatedItems);

            return {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
        }

        case 'REMOVE_ITEM': {
            const updatedItems = state.items.filter(
                (item) => item.id !== action.payload.itemId
            );
            
            // Calculate new totals
            const { totalItems, totalPrice } = calculateTotals(updatedItems);

            return {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity } = action.payload;
            
            // Only update if quantity is valid
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((item) => item.id !== itemId),
                    ...calculateTotals(state.items.filter((item) => item.id !== itemId)),
                };
            }

            const updatedItems = state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            );
            
            // Calculate new totals
            const { totalItems, totalPrice } = calculateTotals(updatedItems);

            return {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
        }

        case 'CLEAR_CART':
            return initialState;

        default:
            return state;
    }
};

// Create the CartProvider component
export const CustomerCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Define the context methods
    const addToCart = (item: MenuItem, quantity = 1) => {
        dispatch({
            type: 'ADD_ITEM',
            payload: { item, quantity },
        });
    };

    const removeFromCart = (itemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const placeOrder = (addOrder: (tableNumber: string, items: { menuItem: MenuItem; quantity: number }[]) => void, currentTable: string | null) => {
        if (state.items.length > 0 && currentTable) {
            // 将购物车转换为订单格式
            const orderItems = state.items.map(item => ({
                menuItem: item,
                quantity: item.quantity
            }));
            
            // 添加订单到全局状态
            addOrder(currentTable, orderItems);
            
            // 清空购物车
            clearCart();
            
            // 可以在这里添加成功提示
            alert(`Order placed successfully for Table ${currentTable}!`);
        }
    };

    // Prepare the context value
    const value = {
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a custom hook to use the cart context
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CustomerCartProvider');
    }
    return context;
};