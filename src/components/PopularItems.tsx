import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { menuData } from '../data/menuData';


export const PopularItems: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const popularItems = menuData.slice(0, 4);
    const itemsPerPage = 2;

    const handlePrevious = () => {
        setCurrentIndex(current => 
            current === 0 ? popularItems.length - itemsPerPage : current - itemsPerPage
        );
    };

    const handleNext = () => {
        setCurrentIndex(current => 
            current + itemsPerPage >= popularItems.length ? 0 : current + itemsPerPage
        );
    };

    const visibleItems = popularItems.slice(currentIndex, currentIndex + itemsPerPage);
    const showNextButton = currentIndex + itemsPerPage < popularItems.length;
    const showPreviousButton = currentIndex > 0;

    return (
        <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">Popular Items</h2>

            <div className="relative">
                {/* Navigation Buttons */}
                {showPreviousButton && (
                    <button
                        onClick={handlePrevious}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Previous items"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                
                {showNextButton && (
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
                            className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[320px]"
                        >
                            <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-medium text-gray-800 mb-2 line-clamp-1">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PopularItems;