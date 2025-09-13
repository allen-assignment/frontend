import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Plus, Minus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { useCart } from '../context/CustomerCartContext';

const CustomerPopularItems: React.FC = () => {
    const { state } = useApp();
    const { addToCart, removeFromCart, updateQuantity, state: cartState } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // 获取前几个可用的菜单项作为热门商品
    const popularItems = useMemo(() => 
        state.menuItems
            .filter(item => item.isAvailable !== false)
            .slice(0, 6),
        [state.menuItems]
    );
        
    const itemsPerPage = 2;

    const handlePrevious = () => {
        setCurrentIndex(current => 
            current === 0 ? Math.max(0, popularItems.length - itemsPerPage) : current - itemsPerPage
        );
    };

    const handleNext = () => {
        setCurrentIndex(current => 
            current + itemsPerPage >= popularItems.length ? 0 : current + itemsPerPage
        );
    };

    const visibleItems = popularItems.slice(currentIndex, currentIndex + itemsPerPage);
    const showNavigationButtons = popularItems.length > itemsPerPage;

    // 获取商品在购物车中的数量
    const getItemQuantity = (itemId: string) => {
        const cartItem = cartState.items.find(item => item.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    };

    // 检查是否应该显示数量选择器
    const shouldShowQuantity = (itemId: string) => {
        return getItemQuantity(itemId) > 0;
    };

    // 检查是否达到库存限制
    const isInventoryReached = (item: any) => {
        const currentQuantity = getItemQuantity(item.id);
        const inventory = item.inventory || 10; // 默认库存为10
        return currentQuantity >= inventory;
    };

    const handleIncrement = (item: any) => {
        const currentQuantity = getItemQuantity(item.id);
        const inventory = item.inventory || 10;
        
        // 检查是否达到库存限制
        if (currentQuantity >= inventory) {
            return; // 不执行任何操作
        }
        
        if (currentQuantity === 0) {
            addToCart(item, 1);
        } else {
            updateQuantity(item.id, currentQuantity + 1);
        }
    };

    const handleDecrement = (item: any) => {
        const currentQuantity = getItemQuantity(item.id);
        if (currentQuantity <= 1) {
            removeFromCart(item.id);
        } else {
            updateQuantity(item.id, currentQuantity - 1);
        }
    };

    const handleAddToCart = (item: any) => {
        addToCart(item, 1);
    };

    if (popularItems.length === 0) {
        return null;
    }

    return (
        <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-xl font-semibold">Popular Items</h2>
            </div>

            <div className="relative">
                {/* Navigation Buttons */}
                {showNavigationButtons && currentIndex > 0 && (
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                        aria-label="Previous items"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {showNavigationButtons && currentIndex + itemsPerPage < popularItems.length && (
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                        aria-label="Next items"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleItems.map((item) => {
                        const quantity = getItemQuantity(item.id);
                        const showQuantity = shouldShowQuantity(item.id);
                        
                        return (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-w-16 aspect-h-9">
                                    <img 
                                        src={item.image_url || '/placeholder-dish.jpg'} 
                                        alt={item.name}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-dish.jpg';
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-red-600">¥{Number(item.price).toFixed(2)}</span>
                                        <div className="flex items-center gap-2">
                                            {!showQuantity ? (
                                                <button 
                                                    onClick={() => handleAddToCart(item)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                                                >
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDecrement(item)}
                                                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-6 text-center font-medium">{quantity}</span>
                                                    <button
                                                        onClick={() => handleIncrement(item)}
                                                        disabled={isInventoryReached(item)}
                                                        className={`p-1 transition-colors ${
                                                            isInventoryReached(item) 
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
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomerPopularItems;