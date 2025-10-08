import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingCart } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI, orderAPI } from '../../services/api';

const MerchantDashboard: React.FC = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    // 初始化loading状态：如果数据已加载则不需要loading
    const [loading, setLoading] = useState(!(state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0));
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);

    // 监听数据状态变化，更新loading状态
    useEffect(() => {
        if (state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0) {
            setLoading(false);
        }
    }, [state.isMenuDataLoaded, state.menuItems]);

    // 从 API 获取菜单数据
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setError(null);
                
                // 检查是否已有数据且商户ID匹配
                const merchantId = state.currentUser?.merchant_id;
                if (state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0 && merchantId) {
                    console.log('📋 使用缓存的菜单数据');
                    setLoading(false);
                    return;
                }
                
                console.log('🔄 从API获取菜单数据...');
                setLoading(true);

                if (!merchantId) {
                    throw new Error('Merchant ID not found. Please login again.');
                }
                
                const response = await menuAPI.getAllMenuItems(merchantId);
                console.log('从API获取的菜单数据:', response.menuItems);
                
                // 将API数据转换为AppContext格式
                const convertedItems = response.menuItems.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price.toString()),
                    image_url: item.image_url,
                    category_id: item.category?.id?.toString() || '1',
                    isAvailable: item.inventory > 0,
                    inventory: item.inventory
                }));
                
                // 更新全局状态
                dispatch({ 
                    type: 'SET_MENU_ITEMS', 
                    payload: convertedItems
                });
            } catch (err) {
                console.error('获取菜单失败:', err);
                setError('Failed to load menu items');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, [dispatch, state.currentUser?.merchant_id]);

    // 获取订单数据
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const merchantId = state.currentUser?.merchant_id;
                if (!merchantId) {
                    return;
                }
                
                const response = await orderAPI.getOrders(merchantId);
                console.log('📋 获取的订单数据:', response.orders);
                
                // 转换API数据格式为AppContext格式
                const convertedOrders = response.orders.map((order: any) => ({
                    id: order.order_id.toString(),
                    tableNumber: order.table_number,
                    items: order.items.map((item: any) => ({
                        menuItem: {
                            id: item.item_id.toString(),
                            name: item.name,
                            description: '',
                            price: item.item_price,
                            image_url: '',
                            category_id: '1',
                            isAvailable: true,
                            inventory: 0
                        },
                        quantity: item.quantity
                    })),
                    status: order.status === 'paid' ? 0 : (order.status === 'cancelled' ? 1 : order.status),
                    total: order.total_price,
                    createdAt: order.order_time
                }));
                
                setOrders(convertedOrders);
                
                // 将转换后的订单数据存储到全局状态
                dispatch({ 
                    type: 'SET_ORDERS', 
                    payload: convertedOrders
                });
            } catch (error) {
                console.error('获取订单失败:', error);
            }
        };

        fetchOrders();
    }, [state.currentUser?.merchant_id]); 

    // 计算统计数据
    const totalMenuItems = state.menuItems.length;
    const availableItems = state.menuItems.filter(item => item.isAvailable !== false).length;
    const totalMembers = state.members.length;
    const totalOrders = orders.length;

    // 加载状态
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading menu data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // 无数据状态 - 新注册的商家用户
    if (!loading && totalMenuItems === 0) {
        return (
            <div className="space-y-6">
                {/* 空状态背景 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        {/* 图标 */}
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-10 h-10 text-blue-600" />
                        </div>
                        
                        {/* 标题和描述 */}
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Dashboard!</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            You haven't added any menu items yet. Start building your menu by adding your first dish or using OCR to scan your existing menu.
                        </p>
                        
                        {/* 操作按钮 */}
                        <div className="space-y-3">
                            <button 
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                onClick={() => navigate('/merchant/menu')}
                            >
                                📝 Add Your First Menu Item
                            </button>
                            
                            <button 
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                onClick={() => navigate('/merchant/ocr')}
                            >
                                📷 Scan Menu with OCR
                            </button>
                        </div>
                        
                        {/* 提示信息 */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                💡 <strong>Tip:</strong> Use OCR to quickly scan your physical menu and automatically extract menu items!
                            </p>
                        </div>
                    </div>
                </div>

                {/* 快速统计卡片 - 显示为0 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Members</p>
                                <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
                            </div>
                        </div>
                    </div> */}

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Menu Items</p>
                                <p className="text-xl font-bold text-gray-800">0/0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">

                {/* <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Members</p>
                            <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
                        </div>
                    </div>
                </div> */}

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Store className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Menu Items</p>
                            <p className="text-xl font-bold text-gray-800">{availableItems}/{totalMenuItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Orders</p>
                            <p className="text-xl font-bold text-gray-800">{totalOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Management Quick Access */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Menu Management</h3>
                <div className="space-y-3">
                    {state.menuItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-green-600">¥{item.price}</div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.isAvailable !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                                    <button 
                        className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => navigate('/merchant/menu')}
                    >
                        Manage Menu
                    </button>

            </div>
        </div>
    );
};

export default MerchantDashboard;