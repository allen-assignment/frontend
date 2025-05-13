import React, { useState, useEffect } from 'react';
import { MenuItem as MenuItemType } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';
import { categories } from '../data/menuData';

interface MenuItemProps {
    item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
    const { addToCart, removeFromCart, state } = useCart();
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
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        addToCart(item, newQuantity);
    };

    const handleDecrement = () => {
        if (quantity <= 1) {
            setShowQuantity(false);
            setQuantity(0);
            removeFromCart(item.id);
        } else {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            addToCart(item, newQuantity);
        }
    };

    const handleAddToCart = () => {
        setShowQuantity(true);
        setQuantity(1);
        addToCart(item, 1);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
                <div className="w-1/3">
                    <div className="h-28 w-full overflow-hidden">
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
            
            <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <span className="font-medium text-black-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                </div>
            
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                {categories.find(c => c.category_id === item.category_id)?.name || item.category_id}
                </span>
                
                <div className="flex items-center gap-2">
                {!showQuantity ? (
                    <button
                    onClick={handleAddToCart}
                    className="px-4 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                    >
                    Add to Cart
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                    <button
                        onClick={handleDecrement}
                        className="p-1 text-gray-600 hover:text-red-600"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-medium">{quantity}</span>
                    <button
                        onClick={handleIncrement}
                        className="p-1 text-gray-600 hover:text-red-600"
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

export default MenuItem; 