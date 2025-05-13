import React from 'react';
import { ShoppingCart, UserCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
    showLoginButtons: boolean;
}

const Header: React.FC<HeaderProps> = ({ showLoginButtons }) => {
    const { state } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isCartPage = location.pathname === '/cart';

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {isCartPage ? (
                        <>
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600"
                            >
                                ←
                            </button>
                            <h1 className="text-lg font-semibold">Your Order</h1>
                        </>
                    ) : (
                        <>
                            <h1 
                                className="text-lg font-semibold cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                Smart Order
                            </h1>
                            {state.tableNumber && (
                                <span className="text-sm text-gray-600">
                                    • Table {state.tableNumber}
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {showLoginButtons && (
                        <button className="text-sm text-gray-600">
                            Sign in
                        </button>
                    )}
                    
                    {!isCartPage && (
                        <button 
                            className="relative"
                            onClick={() => navigate('/cart')}
                            aria-label="Open cart"
                        >
                            <ShoppingCart size={18} />
                            {state.totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {state.totalItems}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;