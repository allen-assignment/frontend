import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import CustomerMenuItem from './CustomerMenuItem';
import { useApp, MenuItem as AppMenuItem } from '../../shared/context/AppContext';
import { menuAPI, MenuItem as APIMenuItem } from '../../services/api';

const CustomerMenuList: React.FC = () => {
    const { state, dispatch } = useApp();
    const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [forceRefresh, setForceRefresh] = useState(false);

    // Get menu data from API (only when global state is empty or force refresh)
    useEffect(() => {
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
                const response = await menuAPI.getAllMenuItems(1); // Default merchant ID, should get from context in real app
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
                    isAvailable: item.inventory > 0,
                    inventory: item.inventory,
                    feature_one: item.feature_one,
                    feature_two: item.feature_two,
                    feature_three: item.feature_three
                }));
                
                setMenuItems(convertedItems);
                
                // Update global state
                dispatch({ 
                    type: 'SET_MENU_ITEMS', 
                    payload: convertedItems
                });
            } catch (err) {
                console.error('Failed to get menu:', err);
                setError('Failed to load menu items');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [dispatch, forceRefresh]);

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
    const availableItems = menuItems.filter(item => (item.inventory || 0) > 0);

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
        <div>
            {/* Reset button */}
            <div className="mb-4 flex justify-end">
                <button
                    onClick={resetMenuData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh Menu'}
                </button>
            </div>
            
            {/* Menu items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableItems.map((item) => (
                    <CustomerMenuItem 
                        key={item.id} 
                        item={item}
                    />
                ))}
            </div>
        </div>
    );
};

export default CustomerMenuList;