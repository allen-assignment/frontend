import React from 'react';
import { ShoppingCart, UserCircle, Store, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CustomerCartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';

interface CustomerHeaderProps {
    showLoginButtons: boolean;
    isLoggedIn: boolean; 
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ showLoginButtons, isLoggedIn }) => {
    const { state } = useCart();
    const { state: appState } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const isCartPage = location.pathname === '/customer/cart';
    const isPersonalInfoPage = location.pathname === '/customer/personal-info' || location.pathname.endsWith('/personal-info');
    const isEditPage = location.pathname.startsWith('/customer/edit/') || location.pathname.startsWith('/edit/');

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {isCartPage ? (
                        <>
                            <button
                                onClick={() => navigate('/customer')}
                                className="text-gray-600"
                            >
                                ←
                            </button>
                            <h1 className="text-lg font-semibold">Your Order</h1>
                        </>
                    ) : isPersonalInfoPage || isEditPage ? (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span>Back</span>
                            </button>
                            <h1 className="text-lg font-semibold">
                                {isPersonalInfoPage ? 'Personal Information' : 'Edit Information'}
                            </h1>
                        </>
                    ) : (
                        <>
                            <h1 
                                className="text-lg font-semibold cursor-pointer"
                                onClick={() => navigate('/customer')}
                            >
                                Smart Order
                            </h1>
                            {appState.currentTable && (
                                <span className="text-sm text-gray-600">
                                    • Table {appState.currentTable}
                                </span>
                            )}
                            {/* 开发环境重置按钮 */}
                            {process.env.NODE_ENV === 'development' && (
                                <button
                                    className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                                    onClick={() => {
                                        localStorage.removeItem('hasSeenWelcome');
                                        window.location.reload();
                                    }}
                                    title="Reset Welcome Modal (Dev only)"
                                >
                                    🔄
                                </button>
                            )}
                        </>
                    )}
                </div>

                {!(isPersonalInfoPage || isEditPage) && (
                    <div className="flex items-center gap-4">
                        {/* 连接状态指示器 */}
                        <div className={`w-2 h-2 rounded-full ${appState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                             title={appState.isConnected ? 'Connected' : 'Disconnected'} />
                        
                        {/* Merchant Mode Button */}
                        <button
                            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded-md hover:bg-blue-50"
                            onClick={() => navigate('/merchant')}
                            title="Switch to Merchant Mode"
                        >
                            <Store size={16} />
                            Merchant
                        </button>

                        {showLoginButtons && (
                            location.pathname === '/login' ? (
                                <button className="text-sm text-gray-600 hover:text-gray-800" onClick={() => {
                                    const redirectTo = new URLSearchParams(location.search).get('redirect');
                                    navigate(redirectTo || '/customer');
                                }}>
                                    ← Back to Menu
                                </button>
                            ) : isLoggedIn ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    Welcome, {appState.currentUser?.username}
                                </span>
                                <button 
                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                    onClick={() => navigate('/customer/profile')}
                                    aria-label="Profile"
                                >
                                    <UserCircle size={20} />
                                </button>
                            </div>
                            ) : (
                                <button 
                                    className="text-sm text-gray-600" 
                                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                                >
                                    Sign in
                                </button>
                            )
                        )}
                        
                        {!isCartPage && (
                            <button 
                                className="relative"
                                onClick={() => navigate('/customer/cart')}
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
                )}
            </div>
        </header>
    );
};

export default CustomerHeader;