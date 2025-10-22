import React, { useState } from 'react';
import { Minus, Plus, Check, Trash2, X } from 'lucide-react';
import { useCart, CartItem } from '../context/CustomerCartContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';
import { orderAPI, paymentAPI } from '../../services/api';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SIQi9Jaz9prsnKpmcPzoay68jG3MVmgUAU8QoVtUxPwxAAzOBujM1iEPrYEdvfneqGmtCIqRjEXIPgle5pEtoMx00D36qCRvo");

const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onPaymentSuccess: () => void;
}> = ({ isOpen, onClose, totalAmount, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!stripe || !elements) {
            setMessage("Payment system is loading...");
            return;
        }

        setIsProcessing(true);

        try {
            const paymentIntent = await paymentAPI.createPaymentIntent({
                amount: Math.round(totalAmount * 100),
                currency: "cny",
                order_id: `order_${Date.now()}`
            });

            if (paymentIntent.error) {
                setMessage(paymentIntent.error);
                setIsProcessing(false);
                return;
            }

            const clientSecret = paymentIntent.client_secret;
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                setMessage("Card element not found");
                setIsProcessing(false);
                return;
            }

            const confirmRes = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (confirmRes.error) {
                setMessage(confirmRes.error.message || "Payment failed");
            } else if (confirmRes.paymentIntent?.status === "succeeded") {
                setMessage("Payment successful");
                setTimeout(() => {
                    onPaymentSuccess();
                }, 1500);
            } else {
                setMessage("Processing...");
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setMessage(`Error: ${err.message || 'Payment failed'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    disabled={isProcessing}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                            ¥{totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Information
                        </label>
                        <div className="border rounded-lg p-3">
                            <CardElement
                                options={{
                                    hidePostalCode: true,
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#32325d",
                                            "::placeholder": { color: "#aab7c4" },
                                        },
                                        invalid: { color: "#fa755a" },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg ${
                            message.startsWith("Payment successful")
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!stripe || isProcessing}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? "Processing..." : `Pay ¥${totalAmount.toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CustomerCart: React.FC = () => {
    const { state, updateQuantity, removeFromCart, clearCart } = useCart();
    const { state: appState } = useApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const navigate = useNavigate();

    const totalWithTax = state.totalPrice * 1.02;

    const handlePlaceOrder = async () => {
        if (state.items.length === 0) return;

        if (!appState.isLoggedIn || !appState.currentUser) {
            const shouldLogin = window.confirm('Please sign in to place an order. Click OK to go to the sign in page.');
            if (shouldLogin) {
                navigate(`/login?redirect=${encodeURIComponent('/customer/cart')}`);
            }
            return;
        }

        const validItems = state.items.filter(item => {
            const itemId = parseInt(item.id);
            const itemIdStr = String(item.id);
            const isValidId = !isNaN(itemId) && itemId > 0 && !itemIdStr.startsWith('unmatched_');
            return isValidId;
        });

        if (validItems.length === 0) {
            alert('No valid items in cart');
            return;
        }

        if (validItems.length < state.items.length) {
            const invalidCount = state.items.length - validItems.length;
            alert(`${invalidCount} items in cart cannot be ordered`);
        }

        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        setIsSubmitting(true);

        try {
            const validItems = state.items.filter(item => {
                const itemId = parseInt(item.id);
                const itemIdStr = String(item.id);
                return !isNaN(itemId) && itemId > 0 && !itemIdStr.startsWith('unmatched_');
            });

            const merchantId = validItems[0]?.merchant_id;

            if (!merchantId) {
                alert('Cannot place order');
                return;
            }

            const orderData = {
                merchant_id: merchantId,
                table_number: appState.currentTable || '1',
                items: validItems.map(item => ({
                    item_id: parseInt(item.id),
                    quantity: item.quantity
                }))
            };

            const response = await orderAPI.createOrder(orderData);
            clearCart();
            setOrderPlaced(true);
            console.log('Order created:', response);
        } catch (error: any) {
            console.error('Order failed:', error);
            alert(`Order failed: ${error.response?.data?.error || error.message || 'Please try again'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartNewOrder = () => {
        setOrderPlaced(false);
        navigate('/customer');
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Order Confirmed</h2>

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

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/customer/order-history')}
                            className="w-full py-3 bg-blue-500 text-white rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            View Order History
                        </button>

                        <button
                            onClick={handleStartNewOrder}
                            className="w-full py-4 bg-red-500 text-white rounded-lg text-lg font-medium hover:bg-red-600 transition-colors"
                        >
                            Start New Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Elements stripe={stripePromise}>
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    totalAmount={totalWithTax}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            </Elements>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {state.items.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center">
                        <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">Add some items from the menu</p>
                        <button
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            onClick={() => navigate('/customer')}
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        {appState.currentTable && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-blue-800">Table {appState.currentTable}</span>
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
                                {appState.isLoggedIn && appState.currentUser && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-800">
                                                Ordering as: <span className="font-medium">{appState.currentUser.username}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>¥{state.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST(2%)</span>
                                        <span>¥{(state.totalPrice * 0.02).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                                        <span>Total</span>
                                        <span>¥{totalWithTax.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting || !appState.currentTable}
                                >
                                    {isSubmitting ? 'Processing...' : `Proceed to Payment`}
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