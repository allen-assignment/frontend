import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MenuItem, useApp } from '../../shared/context/AppContext';

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
    | { type: 'CLEAR_CART' }
    | { type: 'REFRESH_CART'; payload: CartState };

// Helper function to calculate totals (moved up to avoid hoisting issues)
const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    return { totalItems, totalPrice };
};

// Load cart state from localStorage
const loadCartFromStorage = (): CartState => {
    try {
        const savedCart = localStorage.getItem('customer_cart');
        console.log('Loading cart from localStorage:', savedCart);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            console.log('Parsed cart data:', parsedCart);
            // Recalculate totals to ensure consistency
            const { totalItems, totalPrice } = calculateTotals(parsedCart.items || []);
            const cartState = {
                items: parsedCart.items || [],
                totalItems,
                totalPrice,
            };
            console.log('Loaded cart state:', cartState);
            return cartState;
        }
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
    }
    console.log('No cart data found, returning empty state');
    return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
    };
};

// Create the initial cart state
const initialState: CartState = loadCartFromStorage();

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to save cart to localStorage
const saveCartToStorage = (cartState: CartState) => {
    try {
        console.log('Saving cart to localStorage:', cartState);
        localStorage.setItem('customer_cart', JSON.stringify(cartState));
        console.log('Cart saved successfully');
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
    }
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

            const newState = {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
            saveCartToStorage(newState);
            return newState;
        }

        case 'REMOVE_ITEM': {
            const updatedItems = state.items.filter(
                (item) => item.id !== action.payload.itemId
            );
            
            // Calculate new totals
            const { totalItems, totalPrice } = calculateTotals(updatedItems);

            const newState = {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
            saveCartToStorage(newState);
            return newState;
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

            const newState = {
                ...state,
                items: updatedItems,
                totalItems,
                totalPrice,
            };
            saveCartToStorage(newState);
            return newState;
        }

        case 'CLEAR_CART':
            const emptyState = {
                items: [],
                totalItems: 0,
                totalPrice: 0,
            };
            saveCartToStorage(emptyState);
            return emptyState;

        case 'REFRESH_CART':
            // Refresh cart state from localStorage (useful after login)
            console.log('Refreshing cart state:', action.payload);
            return action.payload;

        default:
            return state;
    }
};

// Create the CartProvider component
export const CustomerCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { state: appState } = useApp();
    
    // Force re-sync cart state when component mounts (useful for login scenarios)
    useEffect(() => {
        const savedCart = localStorage.getItem('customer_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                const { totalItems, totalPrice } = calculateTotals(parsedCart.items || []);
                const cartState = {
                    items: parsedCart.items || [],
                    totalItems,
                    totalPrice,
                };
                // Dispatch a custom action to refresh the state
                dispatch({ type: 'REFRESH_CART', payload: cartState });
            } catch (error) {
                console.error('Failed to refresh cart from localStorage:', error);
            }
        }
    }, []); // Only run once on mount
    
    // Listen for login state changes and refresh cart state
    useEffect(() => {
        if (appState.isLoggedIn) {
            console.log('User logged in, refreshing cart state...');
            const savedCart = localStorage.getItem('customer_cart');
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    const { totalItems, totalPrice } = calculateTotals(parsedCart.items || []);
                    const cartState = {
                        items: parsedCart.items || [],
                        totalItems,
                        totalPrice,
                    };
                    dispatch({ type: 'REFRESH_CART', payload: cartState });
                } catch (error) {
                    console.error('Failed to refresh cart after login:', error);
                }
            }
        }
    }, [appState.isLoggedIn]); // Trigger when login state changes

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
            // Convert cart to order format
            const orderItems = state.items.map(item => ({
                menuItem: item,
                quantity: item.quantity
            }));
            
            // Add order to global state
            addOrder(currentTable, orderItems);
            
            // Clear cart
            clearCart();
            
            // Can add success message here
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