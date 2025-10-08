import React, { useState } from 'react';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

const MerchantOrderManagement: React.FC = () => {
    const { state, updateOrderStatus } = useApp();
    const [selectedStatus, setSelectedStatus] = useState<string | number>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    // Use orders from global state
    const orders = state.orders;
    
    // Filter orders based on selected status
    const filteredOrders = selectedStatus === 'all' 
        ? orders 
        : orders.filter(order => order.status === selectedStatus);

    // Sort orders by creation time (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleStatusChange = (orderId: string, newStatus: any) => {
        updateOrderStatus(orderId, newStatus);
    };

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const statusOptions = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 0, label: 'Paid', count: orders.filter(o => o.status === 0).length },
        { value: 1, label: 'Cancelled', count: orders.filter(o => o.status === 1).length }
    ];

    const getStatusColor = (status: string | number) => {
        if (status === 0 || status === 'paid') return 'bg-green-100 text-green-800';
        if (status === 1 || status === 'cancelled') return 'bg-red-100 text-red-800';
        if (typeof status === 'number' && status !== 0 && status !== 1) return 'bg-red-200 text-red-900';
        return 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string | number) => {
        if (status === 0 || status === 'paid') return <CheckCircle className="w-4 h-4" />;
        if (status === 1 || status === 'cancelled') return <XCircle className="w-4 h-4" />;
        if (typeof status === 'number' && status !== 0 && status !== 1) return <XCircle className="w-4 h-4" />;
        return <CheckCircle className="w-4 h-4" />;
    };

    const getStatusText = (status: string | number) => {
        if (status === 0 || status === 'paid') return 'Paid';
        if (status === 1 || status === 'cancelled') return 'Cancelled';
        if (typeof status === 'number' && status !== 0 && status !== 1) return 'Error';
        return String(status);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 text-white w-full">
                <div className="py-4">
                    <h1 className="text-xl font-bold text-center">Order Management</h1>
                </div>
                <div className="h-px bg-gray-300"></div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 pb-24">
                <div className="max-w-4xl mx-auto">
                {/* Status Filter */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedStatus(option.value)}
                            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                selectedStatus === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <div>{option.label}</div>
                            <div className="text-xs opacity-75">({option.count})</div>
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {sortedOrders.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-gray-500">
                                {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
                            </p>
                        </div>
                    ) : (
                        sortedOrders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.id} • {new Date(order.createdAt).toLocaleString()}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-green-600 text-lg">¥{order.total.toFixed(2)}</div>
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewOrder(order)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setShowOrderDetail(false)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
};

// Order Detail Modal Component
const OrderDetailModal: React.FC<{
    order: any;
    onClose: () => void;
    onStatusChange: (orderId: string, status: any) => void;
}> = ({ order, onClose, onStatusChange }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold">Order #{order.id} • {new Date(order.createdAt).toLocaleString()}</h2>
                            <p className="text-gray-600">Table {order.tableNumber}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Items:</h3>
                        <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                        <div className="font-medium">{item.menuItem.name}</div>
                                        <div className="text-sm text-gray-600">¥{item.menuItem.price}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">×{item.quantity}</div>
                                        <div className="text-sm text-green-600">
                                            ¥{(item.menuItem.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4 mb-4">
                        <div className="flex justify-between items-center font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-green-600">¥{order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantOrderManagement;
