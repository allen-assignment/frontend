import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Plus, Minus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { useCart } from '../context/CustomerCartContext';
import MenuItemImage from '../../shared/components/MenuItemImage';

const CustomerPopularItems: React.FC = () => {
    const { state } = useApp();
    const { addToCart, removeFromCart, updateQuantity, state: cartState } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Prioritize recommended items, if no recommended items then use first 5 available menu items as popular items
    const popularItems = useMemo(() => {
        if (state.recommendedItems.length > 0) {
            
            const recommended = state.recommendedItems.slice(0, 5);
            console.log('Display recommended items:', recommended);
            return recommended;
        }
        
        const regularItems = state.menuItems.slice(0, 5);
        return regularItems;
    }, [state.recommendedItems, state.menuItems]);
        
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

    // Get item quantity in cart
    const getItemQuantity = (itemId: string) => {
        const cartItem = cartState.items.find(item => item.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    };

    // Check if should show quantity selector
    const shouldShowQuantity = (itemId: string) => {
        return getItemQuantity(itemId) > 0;
    };

    const isInventoryReached = (item: any) => {
        const currentQuantity = getItemQuantity(item.id);
        const inventory = item.inventory || 10; // Default inventory is 10
        return currentQuantity >= inventory;
    };

    const handleIncrement = (item: any) => {
        const currentQuantity = getItemQuantity(item.id);
        const inventory = item.inventory || 10;
        
        // Check if inventory limit reached
        if (currentQuantity >= inventory) {
            return; // Do nothing
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

    console.log('PopularItems render check:', {
        popularItemsLength: popularItems.length,
        shouldRender: popularItems.length > 0,
        popularItems: popularItems
    });
    
    if (popularItems.length === 0) {
        console.log('PopularItems not rendered: no items');
        return null;
    }

    return (
        <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-xl font-semibold">
                    {state.recommendedItems.length > 0 ? 'Recommended for You' : 'Popular Items'}
                </h2>
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
                                <div className="w-full h-48">
                                    <MenuItemImage
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        fallbackClassName="w-full h-full"
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