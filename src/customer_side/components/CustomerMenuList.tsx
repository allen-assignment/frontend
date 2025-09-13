import React, { useState, useEffect } from 'react';
import CustomerMenuItem from './CustomerMenuItem';
import { useApp, MenuItem as AppMenuItem } from '../../shared/context/AppContext';
import { menuAPI, MenuItem as APIMenuItem } from '../../services/api';

interface CustomerMenuListProps {
    selectedCategory: string;
}

const CustomerMenuList: React.FC<CustomerMenuListProps> = ({ selectedCategory }) => {
    const { state, dispatch } = useApp();
    const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 从API获取菜单数据（仅在全局状态为空时）
    useEffect(() => {
        // 如果全局状态中已有数据，直接使用
        if (state.menuItems && state.menuItems.length > 0) {
            console.log('使用全局状态中的菜单数据:', state.menuItems);
            setMenuItems(state.menuItems);
            setLoading(false);
            return;
        }

        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                const response = await menuAPI.getAllMenuItems();
                console.log('从API获取的菜单数据:', response.menuItems);
                
                // 将API数据转换为AppContext格式
                const convertedItems: AppMenuItem[] = response.menuItems.map((item: APIMenuItem) => ({
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price.toString()),
                    image_url: item.image_url,
                    category_id: item.category?.id?.toString() || '1',
                    isAvailable: item.inventory > 0,
                    inventory: item.inventory
                }));
                
                setMenuItems(convertedItems);
                
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

        fetchMenuItems();
    }, [dispatch, state.menuItems]);
    
    // 过滤可用的菜单项
    const availableItems = menuItems.filter(item => (item.inventory || 0) > 0);
    
    const filteredItems = selectedCategory === 'all'
        ? availableItems
        : availableItems.filter(item => {
            const categoryId = item.category_id || '1';
            return categoryId === selectedCategory;
        });

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

    if (filteredItems.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                    {selectedCategory === 'all' ? 'No menu items available' : 'No items in this category'}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
                <CustomerMenuItem 
                    key={item.id} 
                    item={item}
                />
            ))}
        </div>
    );
};

export default CustomerMenuList;