import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI } from '../../services/api';

const MerchantDashboard: React.FC = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 从 API 获取菜单数据
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 如果全局状态中已有数据，直接使用
                if (state.menuItems && state.menuItems.length > 0) {
                    setLoading(false);
                    return;
                }

                const response = await menuAPI.getAllMenuItems();
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
    }, [dispatch, state.menuItems]);

    // 计算统计数据
    const totalMenuItems = state.menuItems.length;
    const availableItems = state.menuItems.filter(item => item.isAvailable !== false).length;
    const totalMembers = state.members.length;

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

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Members</p>
                            <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Store className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Menu Items</p>
                            <p className="text-xl font-bold text-gray-800">{availableItems}/{totalMenuItems}</p>
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
                    
                    {/* <div className="mt-4 pt-4 border-t border-gray-200">
                        <button 
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            onClick={() => navigate('/merchant/ocr')}
                        >
                            📷 OCR Menu Recognition
                        </button>
                    </div> */}
            </div>
        </div>
    );
};

export default MerchantDashboard;