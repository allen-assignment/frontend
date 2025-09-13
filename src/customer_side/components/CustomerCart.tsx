import React, { useState } from 'react';
import { Minus, Plus, Check, Trash2 } from 'lucide-react';
import { useCart, CartItem } from '../context/CustomerCartContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';
import { orderAPI } from '../../services/api';

const CustomerCart: React.FC = () => {
    const { state, updateQuantity, removeFromCart, clearCart, placeOrder } = useCart();
    const { state: appState, addOrder } = useApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const navigate = useNavigate();

    // Handle placing an order
    const handlePlaceOrder = async () => {
        if (state.items.length === 0) return;

        // 检查是否已登录
        if (!appState.isLoggedIn || !appState.currentUser) {
            // 直接显示弹框提示并跳转到登录页面
            const shouldLogin = window.confirm('Please sign in to place an order. Click OK to go to the sign in page.');
            if (shouldLogin) {
                navigate(`/login?redirect=${encodeURIComponent('/customer/cart')}`);
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // 准备订单数据
            const orderData = {
                user_id: parseInt(appState.currentUser.id),
                table_number: appState.currentTable || '1',
                items: state.items.map(item => ({
                    item_id: parseInt(item.id),
                    quantity: item.quantity
                }))
            };

            // 调用API创建订单
            const response = await orderAPI.createOrder(orderData);
            
            // 清空购物车
            clearCart();
            
            // 显示成功消息
            setOrderPlaced(true);
            
            console.log('订单创建成功:', response);
        } catch (error) {
            console.error('下单失败:', error);
            alert('下单失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle starting a new order
    const handleStartNewOrder = () => {
        setOrderPlaced(false);
        navigate('/customer');
    };


    // Order success view
    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">Order Confirmed!</h2>
                    
                    <p className="text-gray-600 text-lg mb-4">
                        Your order has been received and is being prepared for Table {appState.currentTable}.
                    </p>
                    
                    {appState.isLoggedIn && appState.currentUser && (
                        <p className="text-gray-600 text-sm mb-6">
                            Order placed by: <span className="font-medium text-blue-600">{appState.currentUser.username}</span>
                        </p>
                    )}
                    
                    <p className="text-xl font-semibold mb-8 text-blue-600">
                        Estimated waiting time: 15-20 min
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-blue-800">
                            💡 You can check your order status in the merchant dashboard
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleStartNewOrder}
                        className="w-full py-4 bg-red-500 text-white rounded-lg text-lg font-medium hover:bg-red-600 transition-colors"
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
                            onClick={() => navigate('/customer')}
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table info */}
                        {appState.currentTable && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-blue-800">Table {appState.currentTable}</span>
                                    <span className={`w-2 h-2 rounded-full ${appState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg mb-4">
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-semibold">Order Items ({state.totalItems})</h2>
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
                                {/* User info */}
                                {appState.isLoggedIn && appState.currentUser && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-800">
                                                Ordering as: <span className="font-medium">{appState.currentUser.username}</span>
                                            </span>
                                            <span className="w-2 h-2 rounded-full bg-green-500" title="Logged in" />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>¥{state.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST(10%)</span>
                                        <span>¥{(state.totalPrice * 0.1).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                                        <span>Total</span>
                                        <span>¥{(state.totalPrice * 1.1).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting || !appState.currentTable}
                                >
                                    {isSubmitting ? 'Processing...' : `Place Order `}
                                </button>

                                {!appState.currentTable && (
                                    <p className="text-sm text-red-500 text-center mt-2">
                                        Please set a table number first
                                    </p>
                                )}
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
                <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                    <p className="text-sm text-blue-600">¥{item.price}</p>
                </div>
                <span className="font-medium ml-4">¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button 
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        <Minus size={20} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button 
                        className="text-gray-400 hover:text-green-500 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                <button 
                    className="text-red-500 hover:text-red-700 transition-colors"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default CustomerCart;