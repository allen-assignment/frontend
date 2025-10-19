import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../services/api";
import "./OrderHistory.css";

const OrderHistory = ({ userId, showHeader = false }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        console.log('OrderHistory useEffect - loading order data from API');
        // Get order data from API
        orderAPI.getUserOrders()
            .then((res) => {
                console.log('OrderHistory - order data loaded:', res.orders?.length || 0, 'orders');
                setOrders(res.orders || []);
            })
            .catch(() => {
                setError("Failed to load order data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="text-center">
            {showHeader && <h1 className="text-2xl font-bold mb-6">Order History</h1>}
            <Spinner animation="border" className="mt-3" />
        </div>
    );
    
    if (error) return (
        <div className="text-center">
            {showHeader && <h1 className="text-2xl font-bold mb-6">Order History</h1>}
            <Alert variant="danger" className="mt-3">{error}</Alert>
        </div>
    );

    return (
        <div className="order-history">
            {showHeader && (
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => navigate('/customer', { replace: true })}
                        className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">Order History</h1>
                    <div className="w-24"></div> {/* Spacer for centering */}
                </div>
            )}
            {orders.map((order) => (
                <Card key={order.order_id} className="mb-4 shadow-sm p-3 history-card">
                    <div className="order-header">
                        <h6 className="mb-0">Order ID #{order.order_id}</h6>
                        <Badge bg={order.status === "paid" ? "success" : (order.status === "cancelled" ? "danger" : "secondary")}>
                            {order.status === "paid" ? "Paid" : (order.status === "cancelled" ? "Cancelled" : "Error")}
                        </Badge>
                    </div>
                    <div className="order-meta">Order Time: {order.order_time}</div>
                    <div className="order-meta">Table Number: {order.table_number}</div>
                    <div className="order-total">Total Amount: <strong>${order.total_price.toFixed(2)}</strong></div>

                    <div>
                        <strong>Order Details:</strong>
                        <ul className="order-items mt-2 ps-3">
                            {order.items.map((item, idx) => (
                                <li key={idx}>
                                    <div><strong>{item.name}</strong></div>
                                    <div className="item-detail">Quantity: {item.quantity}</div>
                                    <div className="item-detail">Unit Price: ${item.item_price.toFixed(2)}</div>
                                    <div className="item-detail">Subtotal: ${item.subtotal.toFixed(2)}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default OrderHistory;