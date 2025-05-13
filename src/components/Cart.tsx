import React, { useState } from 'react';
import { X, ChevronRight, Minus, Plus, AlertTriangle, Trash2, ArrowLeft,Check } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC= () => {
    const { state, updateQuantity, removeFromCart, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const navigate = useNavigate();

  // Handle placing an order
    const handlePlaceOrder = () => {
        if (state.items.length === 0) return;

        setIsSubmitting(true);

        // Simulate order submission
        setTimeout(() => {
                const randomOrderNumber = Math.floor(10000 + Math.random() * 90000).toString();
                setOrderNumber(randomOrderNumber);
                setOrderPlaced(true);
                setIsSubmitting(false);
                clearCart();
            }, 1500);
    };

    // Handle starting a new order
    const handleStartNewOrder = () => {
    navigate('/');
    };

    // Handle clearing the cart
    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-green-500" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
                
                <p className="text-gray-600 text-lg mb-6">
                    Your order #{orderNumber} has been received and is being prepared.
                </p>
                
                <p className="text-xl font-semibold mb-8">
                    Estimated waiting time: 15-20 min
                </p>
                
                <button 
                    onClick={handleStartNewOrder}
                    className="w-full py-4 bg-red-400 text-white rounded-lg text-lg font-medium hover:bg-red-500 transition-colors"
                >
                    Start New Order
                </button>
            </div>
        </div>
    );
}

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {state.items.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 mb-6">Add some delicious items from the menu to start your order.</p>
                    <button 
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Browse Menu
                    </button>
                    </div>
                ) : (
                <>
                    <div className="bg-white rounded-lg mb-4">
                        <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold">Order Items</h2>
                        </div>
                        <div className="divide-y">
                        {state.items.map((item) => (
                            <CartItemRow 
                            key={item.id} 
                            item={item} 
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg">
                    <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                    </div>
                    <div className="p-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${state.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${(state.totalPrice * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                        <span>Total</span>
                        <span>${(state.totalPrice * 1.08).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button 
                        className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors mt-6"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                    </div>
                </div>
                </>
            )}
            </div>
        </div>
        );
    };

// Component for individual cart items
const CartItemRow: React.FC<{
    item: CartItem;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    }> = ({ item, updateQuantity, removeFromCart }) => {
    return (
        <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
            </div>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
            <button 
                className="text-gray-400"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
                <Minus size={20} />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button 
                className="text-gray-400"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
                <Plus size={20} />
            </button>
            </div>
            
            <button 
            className="text-red-500"
            onClick={() => removeFromCart(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            >
            <Trash2 size={20} />
            </button>
        </div>
        </div>
    );
};

export default Cart;