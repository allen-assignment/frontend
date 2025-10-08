import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI } from '../../services/api';
import MerchantEditModal from './MerchantEditModal';
import MenuItemImage from '../../shared/components/MenuItemImage';

const MerchantMenuManagement: React.FC = () => {
    const { state, dispatch, updateMenuItem, deleteMenuItem, setCategories } = useApp();
    const navigate = useNavigate();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    // Initialize loading state: no loading needed if data is already loaded
    const [loading, setLoading] = useState(!(state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0));
    const [error, setError] = useState<string | null>(null);
    
    // Monitor data state changes and update loading state
    useEffect(() => {
        if (state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0) {
            setLoading(false);
        }
    }, [state.isMenuDataLoaded, state.menuItems]);
    
    // Fetch menu data from API
    useEffect(() => {
        let isMounted = true; // Add flag to avoid state updates after component unmount
        
        const fetchMenuData = async () => {
            try {
                setError(null);
                
                // Check if data already exists and merchant ID matches
                const merchantId = state.currentUser?.merchant_id;
                if (state.isMenuDataLoaded && state.menuItems && state.menuItems.length > 0 && merchantId) {
                    console.log('📋 Using cached menu data');
                    setLoading(false);
                    return;
                }
                
                console.log('🔄 Fetching menu data from API...');
                setLoading(true);
                if (!merchantId) {
                    throw new Error('Merchant ID not found. Please login again.');
                }
                
                const response = await menuAPI.getAllMenuItems(merchantId);
                console.log('Menu data from API:', response.menuItems);
                
                // Check if component is still mounted
                if (!isMounted) return;
                
                // Extract unique categories from menu data
                const categoryMap = new Map();
                response.menuItems.forEach((item: any) => {
                    if (item.category && !categoryMap.has(item.category.id)) {
                        categoryMap.set(item.category.id, {
                            id: item.category.id,
                            name: item.category.name
                        });
                    }
                });
                const uniqueCategories = Array.from(categoryMap.values());
                // Set category data to global state
                setCategories(uniqueCategories);
                
                // Convert API data to AppContext format
                const convertedItems = response.menuItems.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price.toString()),
                    image_url: item.image_url,
                    category_id: item.category?.id?.toString() || '1',
                    category_name: item.category?.name || 'Unknown',
                    isAvailable: item.inventory > 0,
                    inventory: item.inventory
                }));
                
                // Update global state
                dispatch({ 
                    type: 'SET_MENU_ITEMS', 
                    payload: convertedItems
                });
            } catch (err: any) {
                console.error('Failed to fetch menu:', err);
                if (isMounted) {
                    setError('Failed to load menu items');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMenuData();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [state.currentUser?.merchant_id, state.isMenuDataLoaded, state.menuItems.length]); // Monitor merchant ID and data state changes

    const handleEditClick = (item: any) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleToggleAvailability = async (item: any) => {
        try {
            const newAvailability = !item.isAvailable;
            await menuAPI.updateMenuItem({
                id: parseInt(item.id),
                isAvailable: newAvailability ? 1 : 0
            });
            
            // Update local state
            updateMenuItem({
                ...item,
                isAvailable: newAvailability
            });
        } catch (error) {
            console.error('Failed to update menu item availability:', error);
            alert('Update failed, please try again');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                console.log('🗑️ Preparing to delete menu item:', {
                    id: id,
                    parsedId: parseInt(id),
                    requestData: { id: parseInt(id) }
                });
                
                const response = await menuAPI.deleteMenuItem({
                    id: parseInt(id)
                });
                
                console.log('✅ Delete API response:', response);
                
                // Remove from local state
                deleteMenuItem(id);
                console.log('✅ Local state updated');
            } catch (error: any) {
                console.error('❌ Failed to delete menu item:', error);
                console.error('❌ Error details:', error.response?.data);
                alert(`Delete failed: ${error.response?.data?.error || error.message || 'Please try again'}`);
            }
        }
    };


    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50">
                <div className="bg-gray-800 text-white w-full">
                    <div className="py-4">
                        <div className="flex items-center justify-between px-6">
                            <div className="w-10 h-10"></div>
                            <h1 className="text-xl font-bold text-center">Menu Management</h1>
                            <div className="w-10 h-10"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading menu data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen w-full bg-gray-50">
                <div className="bg-gray-800 text-white w-full">
                    <div className="py-4">
                        <div className="flex items-center justify-between px-6">
                            <div className="w-10 h-10"></div>
                            <h1 className="text-xl font-bold text-center">Menu Management</h1>
                            <div className="w-10 h-10"></div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
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
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 text-white w-full">
                <div className="py-4">
                    <div className="flex items-center justify-between px-6">
                        <div className="w-10 h-10"></div>
                        <h1 className="text-xl font-bold text-center flex-1">Menu Management</h1>
                        <button 
                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                            onClick={() => navigate('/merchant/menu/add')}
                            title="Add Menu Item"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
                <div className="h-px bg-gray-300"></div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 pb-24">
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{state.menuItems.length}</div>
                        <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {state.menuItems.filter(item => item.isAvailable !== false).length}
                        </div>
                        <div className="text-sm text-gray-600">Available</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">
                            {state.menuItems.filter(item => item.isAvailable === false).length}
                        </div>
                        <div className="text-sm text-gray-600">Unavailable</div>
                    </div>
                </div>

                {/* Menu Items List */}
                <div className="space-y-4">
                    {state.menuItems.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-gray-500 mb-4">No menu items yet</p>
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => navigate('/merchant/menu/add')}
                            >
                                Add First Item
                            </button>
                        </div>
                    ) : (
                        state.menuItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex">
                                    {/* Left Section - Image */}
                                    <div className="w-24 h-24 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 overflow-hidden">
                                        <MenuItemImage
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            fallbackClassName="w-full h-full"
                                        />
                                    </div>
                                    
                                    {/* Right Section - Content */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        {/* Top Section */}
                                        <div className="mb-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    item.isAvailable !== false 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-green-600">¥{item.price}</p>
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                        </div>
                                        
                                        {/* Category and Ingredients */}
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500">
                                                Category: {(item as any).category_name || 'Unknown'}
                                            </p>
                                            {/* {item.ingredients && item.ingredients.length > 0 && (
                                                <p className="text-sm text-gray-500">
                                                    Ingredients: {item.ingredients.join(', ')}
                                                </p>
                                            )} */}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex space-x-3">
                                            <button 
                                                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                onClick={() => handleEditClick(item)}
                                            >
                                                <Edit className="w-4 h-4 inline mr-1" />
                                                Edit
                                            </button>
                                            <button 
                                                className={`px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium ${
                                                    item.isAvailable !== false ? 'text-orange-600' : 'text-green-600'
                                                }`}
                                                onClick={() => handleToggleAvailability(item)}
                                            >
                                                {item.isAvailable !== false ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4 inline mr-1" />
                                                        Hide
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 inline mr-1" />
                                                        Show
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4 inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <MerchantEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                editingItem={editingItem}
                categories={state.categories}
            />
        </div>
    );
};

export default MerchantMenuManagement;