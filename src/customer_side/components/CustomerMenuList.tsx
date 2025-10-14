import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CustomerMenuItem from './CustomerMenuItem';
import { useApp, MenuItem as AppMenuItem } from '../../shared/context/AppContext';
import { menuAPI, MenuItem as APIMenuItem } from '../../services/api';

const CustomerMenuList: React.FC = () => {
    const { state, dispatch } = useApp();
    const location = useLocation();
    const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [forceRefresh, setForceRefresh] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    // Get merchant ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const merchantId = urlParams.get('merchant_id');

    // Get menu data from API (only when global state is empty or force refresh)
    useEffect(() => {
        // Check if welcome page has been seen, if not, don't load menu
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setLoading(false);
            return;
        }
        
        // If global state already has data and not force refresh, use directly
        if (state.menuItems && state.menuItems.length > 0 && !forceRefresh) {
            console.log('Using menu data from global state:', state.menuItems);
            setMenuItems(state.menuItems);
            setLoading(false);
            return;
        }

        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                
                // Determine which merchant ID to use:
                // 1. Priority: URL parameter merchant_id
                // 2. If no URL parameter and user is logged in, use token authentication (no merchant_id)
                // 3. If no URL parameter and user is not logged in, use default merchant ID=1
                let merchantIdParam: number | undefined;
                
                if (merchantId) {
                    // Has URL parameter, use it
                    merchantIdParam = parseInt(merchantId);
                } else if (state.isLoggedIn && state.currentUser) {
                    // User is logged in, use merchant_id from current user context
                    // merchant_id is already known from welcome page
                    merchantIdParam = state.currentUser.merchant_id || 1;
                } else {
                    // User not logged in and no URL parameter, use default merchant ID
                    merchantIdParam = 1;
                }
                
                console.log('Fetching menu items...', {
                    merchantIdFromUrl: merchantId,
                    merchantIdParam,
                    isLoggedIn: state.isLoggedIn,
                    hasToken: !!state.currentUser,
                    userMerchantId: state.currentUser?.merchant_id,
                    strategy: merchantId ? 'URL parameter' : (state.isLoggedIn ? 'User context merchant_id' : 'Default merchant ID')
                });
                
                const response = await menuAPI.getAllMenuItems(merchantIdParam);
                console.log('Menu data from API:', response.menuItems);
                
                // Convert API data to AppContext format
                const convertedItems: AppMenuItem[] = response.menuItems.map((item: APIMenuItem) => ({
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description || '',
                    price: parseFloat(item.price.toString()),
                    image_url: item.image_url,
                    category_id: item.category?.id?.toString() || '1',
                    category: item.category ? {
                        id: item.category.id,
                        name: item.category.name
                    } : undefined,
                    merchant_id: item.merchant_id,  // Keep merchant_id for ordering
                    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                    inventory: item.inventory || 0,
                    feature_one: item.feature_one,
                    feature_two: item.feature_two,
                    feature_three: item.feature_three
                }));
                
                console.log('Converted menu items count:', convertedItems.length);
                console.log('Converted menu items example:', convertedItems.slice(0, 2));
                
                setMenuItems(convertedItems);
                console.log('Local menu items state set');
                
                // Update global state
                dispatch({ 
                    type: 'SET_MENU_ITEMS', 
                    payload: convertedItems
                });
                console.log('Global menu items state updated');
                
                // Verify global state update
                setTimeout(() => {
                    console.log('Verify global state:', {
                        localStateLength: convertedItems.length,
                        globalStateLength: state.menuItems.length,
                        globalStateFirst3Items: state.menuItems.slice(0, 3)
                    });
                }, 100);
            } catch (err) {
                console.error('Failed to get menu:', err);
                setError('Failed to load menu items');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [dispatch, forceRefresh, merchantId]);

    // Method to reset data
    const resetMenuData = () => {
        setForceRefresh(true);
        setError(null);
        // Clear global state
        dispatch({ 
            type: 'SET_MENU_ITEMS', 
            payload: [] 
        });
        // Reset force refresh flag
        setTimeout(() => setForceRefresh(false), 100);
    };
    
    // Filter available menu items, show all data
    // Temporarily remove inventory filter, show all menu items
    const availableItems = menuItems; // .filter(item => (item.inventory || 0) > 0);
    
    // Group items by category
    const itemsByCategory = availableItems.reduce((acc, item) => {
        const categoryName = item.category?.name || 'Other';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {} as Record<string, AppMenuItem[]>);
    
    // Get all unique categories
    const categories = ['All', ...Object.keys(itemsByCategory)];
    
    // Filter items based on selected category
    const filteredItems = selectedCategory === 'All' 
        ? availableItems 
        : itemsByCategory[selectedCategory] || [];
    
    console.log('Menu items statistics:', {
        totalMenuItems: menuItems.length,
        availableMenuItems: availableItems.length,
        localState: menuItems.length,
        globalState: state.menuItems.length,
        categoriesCount: Object.keys(itemsByCategory).length,
        categoriesList: Object.keys(itemsByCategory)
    });
    
    if (menuItems.length > 0) {
        console.log('Has menu items, should display:', menuItems.slice(0, 2));
    } else {
        console.log('No menu items');
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Loading menu items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 text-lg">{error}</div>
            </div>
        );
    }

    if (availableItems.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                    No menu items available
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Filter Tabs */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Menu items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <CustomerMenuItem 
                        key={item.id} 
                        item={item}
                    />
                ))}
            </div>
            
            {/* No items message */}
            {filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        No items found in {selectedCategory} category
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerMenuList;