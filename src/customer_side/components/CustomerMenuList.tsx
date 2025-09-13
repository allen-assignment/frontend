import React from 'react';
import CustomerMenuItem from './CustomerMenuItem';
import { MenuItem as MenuItemType } from '../../shared/context/AppContext';
import { useApp } from '../../shared/context/AppContext';

interface CustomerMenuListProps {
    selectedCategory: string;
}

const CustomerMenuList: React.FC<CustomerMenuListProps> = ({ selectedCategory }) => {
    const { state } = useApp();
    
    // 过滤可用的菜单项
    const availableItems = state.menuItems.filter(item => item.isAvailable !== false);
    
    const filteredItems = selectedCategory === 'all'
        ? availableItems
        : availableItems.filter(item => item.category_id === selectedCategory);

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
        <div className="grid grid-cols-1 gap-4 pb-24">
            {filteredItems.map((item: MenuItemType) => (
                <CustomerMenuItem 
                    key={item.id} 
                    item={item}
                />
            ))}
        </div>
    );
};

export default CustomerMenuList;