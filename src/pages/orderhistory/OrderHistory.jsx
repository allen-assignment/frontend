import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, Badge } from "react-bootstrap";
import axios from "axios";
import "./OrderHistory.css";

const OrderHistory = ({ userId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:8000/order/getOrders/?user_id=${userId}`)
            .then((res) => {
                setOrders(res.data.orders || []);
            })
            .catch(() => {
                setError("Failed to load order data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <Spinner animation="border" className="mt-3" />;
    if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

    return (
        <div className="order-history">
            {orders.map((order) => (
                <Card key={order.order_id} className="mb-4 shadow-sm p-3 history-card">
                    <div className="order-header">
                        <h6 className="mb-0">Order ID #{order.order_id}</h6>
                        <Badge bg={order.status === "paid" ? "success" : "secondary"}>
                            {order.status === "paid" ? "Paid" : "Cancelled"}
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