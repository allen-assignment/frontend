import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

const CustomerPopularItems: React.FC = () => {
    const { state } = useApp();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // 获取前几个可用的菜单项作为热门商品
    const popularItems = state.menuItems
        .filter(item => item.isAvailable !== false)
        .slice(0, 6);
        
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
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Previous items"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                
                {showNavigationButtons && currentIndex + itemsPerPage < popularItems.length && (
                    <button
                        onClick={handleNext}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Next items"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-2 gap-4 px-4">
                    {visibleItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[320px] border border-gray-100"
                        >
                            <div className="relative h-48 w-full overflow-hidden flex-shrink-0 bg-gray-100">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}
                                
                                {/* Popular badge */}
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    Popular
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-800 line-clamp-1 flex-1">
                                        {item.name}
                                    </h3>
                                    <span className="font-semibold text-green-600 text-sm ml-2">
                                        ¥{item.price}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                                    {item.description}
                                </p>
                                
                                {/* Ingredients */}
                                {item.ingredients && item.ingredients.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">
                                            {item.ingredients.slice(0, 3).join(', ')}
                                            {item.ingredients.length > 3 && '...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots indicator */}
                {showNavigationButtons && (
                    <div className="flex justify-center mt-4 gap-2">
                        {Array.from({ length: Math.ceil(popularItems.length / itemsPerPage) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index * itemsPerPage)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    Math.floor(currentIndex / itemsPerPage) === index 
                                        ? 'bg-red-500' 
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPopularItems;