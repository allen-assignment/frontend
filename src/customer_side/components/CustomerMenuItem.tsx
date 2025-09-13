import React, { useState, useEffect } from 'react';
import { MenuItem as MenuItemType } from '../../shared/context/AppContext';
import { useCart } from '../context/CustomerCartContext';
import { Plus, Minus } from 'lucide-react';

// 分类映射 - 对应后台返回的数字ID
const categoryNames: { [key: string]: string } = {
    '1': 'Chicken',
    '2': 'Classic',
    '3': 'Supreme',
    '4': 'Veggie'
};

interface CustomerMenuItemProps {
    item: MenuItemType;
}

const CustomerMenuItem: React.FC<CustomerMenuItemProps> = ({ item }) => {
    const { addToCart, removeFromCart, updateQuantity, state } = useCart();
    const [quantity, setQuantity] = useState(0);
    const [showQuantity, setShowQuantity] = useState(false);

    // Sync with cart state
    useEffect(() => {
        const cartItem = state.items.find(i => i.id === item.id);
        if (cartItem) {
            setQuantity(cartItem.quantity);
            setShowQuantity(true);
        } else {
            setQuantity(0);
            setShowQuantity(false);
        }
    }, [state.items, item.id]);

    const handleIncrement = () => {
        const inventory = item.inventory || 10; // 默认库存为10
        
        // 检查是否达到库存限制
        if (quantity >= inventory) {
            return; // 不执行任何操作
        }
        
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        
        if (quantity === 0) {
            addToCart(item, 1);
            setShowQuantity(true);
        } else {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleDecrement = () => {
        if (quantity <= 1) {
            setShowQuantity(false);
            setQuantity(0);
            removeFromCart(item.id);
        } else {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleAddToCart = () => {
        setShowQuantity(true);
        setQuantity(1);
        addToCart(item, 1);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="flex">
                <div className="w-1/3">
                    <div className="h-28 w-full overflow-hidden bg-gray-100">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <span className="text-xs">No Image</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                            <span className="font-medium text-green-600 text-lg">¥{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                        
                        {/* 显示食材信息（如果有） */}
                        {item.ingredients && item.ingredients.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {item.ingredients.join(', ')}
                            </p>
                        )}
                    </div>
                
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                            {categoryNames[item.category_id] || item.category_id}
                        </span>
                        
                        <div className="flex items-center gap-2">
                            {!showQuantity ? (
                                <button
                                    onClick={handleAddToCart}
                                    className="px-4 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                                    disabled={item.isAvailable === false}
                                >
                                    {item.isAvailable === false ? 'Unavailable' : 'Add to Cart'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDecrement}
                                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-6 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={handleIncrement}
                                        disabled={quantity >= (item.inventory || 10)}
                                        className={`p-1 transition-colors ${
                                            quantity >= (item.inventory || 10)
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-600 hover:text-red-600'
                                        }`}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerMenuItem;