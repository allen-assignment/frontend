import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

const MerchantDashboard: React.FC = () => {
    const { state } = useApp();
    const navigate = useNavigate();

    // 计算统计数据
    const totalMenuItems = state.menuItems.length;
    const availableItems = state.menuItems.filter(item => item.isAvailable !== false).length;
    const totalMembers = state.members.length;

    return (
        <div className="space-y-6">
            {/* Customer Mode Button */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Customer Mode</h3>
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-800 transition-colors border border-green-200 rounded-md hover:bg-green-50"
                        onClick={() => navigate('/customer')}
                        title="Switch to Customer Mode"
                    >
                        <Store size={16} />
                        Customer View
                    </button>
                </div>
                <p className="text-gray-500 text-sm">
                    Switch to customer mode to view the restaurant menu and place orders.
                </p>
            </div>

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