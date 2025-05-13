import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import { MenuItem as MenuItemType } from '../context/CartContext';
// import { menuData } from '../data/menuData';

interface MenuListProps {
    selectedCategory: string;
    menuData: MenuItemType[];
}

const MenuList: React.FC<MenuListProps> = ({ selectedCategory, menuData }) => {
    // const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchMenuItems = async () => {
    //         try {
    //             setLoading(true);
    //             const items = await menuApi.getAllMenuItems();
    //             setMenuItems(items);
    //             setError(null);
    //         } catch (err) {
    //             setError('获取菜单数据失败，请稍后重试');
    //             console.error('Error fetching menu items:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchMenuItems();
    // }, []);

    const filteredItems = selectedCategory === 'all'
        ? menuData
        : menuData.filter(item => item.category_id === selectedCategory);

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="text-center text-red-500 p-4">
    //             {error}
    //         </div>
    //     );
    // }

    return (
        <div className="grid grid-cols-1 gap-4 pb-24">
            {filteredItems.map((item: MenuItemType) => (
                <MenuItem 
                    key={item.id} 
                    item={item}
                />
            ))}
        </div>
    );
};

export default MenuList;