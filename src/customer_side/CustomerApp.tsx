import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerCartProvider } from './context/CustomerCartContext';
import { useApp } from '../shared/context/AppContext';
import CustomerHeader from './components/CustomerHeader';
import CustomerMenuList from './components/CustomerMenuList';
import CustomerCart from './components/CustomerCart';
import CustomerWelcomeModal from './components/CustomerWelcomeModal';
import CustomerPopularItems from './components/CustomerPopularItems';
import Profile from '../pages/profile/Profile';
import PersonalInfo from '../pages/userInfo/PersonalInfo';
import OrderHistory from '../pages/orderhistory/OrderHistory';
import EditField from '../edit/EditField';
import { categories } from '../data/menuData';

const CustomerAppContent: React.FC = () => {
    const { setCurrentTable, state } = useApp();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // 使用AppContext中的登录状态
    const isLogin = state.isLoggedIn;

    // Generate random table number for demo
    useEffect(() => {
        if (!state.currentTable) {
            const randomTable = Math.floor(Math.random() * 20) + 1;
            setCurrentTable(randomTable.toString());
        }
    }, [setCurrentTable, state.currentTable]);

    // 检查登录状态和首次访问
    useEffect(() => {
        // 如果用户已登录，直接显示菜单，不显示 welcome modal
        if (isLogin) {
            setShowWelcomeModal(false);
            setShowMenu(true);
        } else {
            // 未登录用户检查是否首次访问
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (!hasSeenWelcome) {
                setShowWelcomeModal(true);
                setShowMenu(false); // modal 显示时隐藏菜单
            } else {
                setShowWelcomeModal(false);
                setShowMenu(true);
            }
        }
    }, [isLogin]);

    const handleWelcomeClose = () => {
        setShowWelcomeModal(false);
        setShowMenu(true);
        // 记住用户已经看过欢迎页面
        localStorage.setItem('hasSeenWelcome', 'true');
    };

    return (
        <div className="min-h-screen bg-white">
            
            {/* Welcome Modal */}
            <CustomerWelcomeModal 
                isOpen={showWelcomeModal} 
                onClose={handleWelcomeClose} 
            />
            
            {/* Header - Show when menu is visible */}
            {showMenu && (
                <CustomerHeader showLoginButtons={true} isLoggedIn={isLogin} />
            )}
            
            {/* Main Content */}
            <Routes>
                <Route path="/cart" element={<CustomerCart />} />
                <Route path="/profile" element={<Profile userId={state.currentUser?.id} />} />
                <Route path="/personal-info" element={<PersonalInfo />} />
                <Route path="/edit/:field" element={<EditField />} />
                
                <Route path="/" element={
                    <main className={showMenu ? "pt-16" : ""}>
                        {showMenu && (
                            <div className="container mx-auto px-4">
                                {/* Popular Items Section */}
                                <CustomerPopularItems />
                                
                                {/* Categories Filter */}
                                <div className="mt-8 mb-6 bg-gray-100 p-4 rounded-lg">
                                    <div className="overflow-x-auto">
                                        <div className="flex gap-2 min-w-max">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.category_id}
                                                    onClick={() => setSelectedCategory(category.category_id)}
                                                    className={`px-5 py-2 rounded-md font-medium transition-colors ${
                                                        selectedCategory === category.category_id
                                                            ? 'bg-red-500 text-white shadow'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-transparent'
                                                    }`}
                                                >
                                                    {category.category_name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div> 
                                
                                {/* Menu List */}
                                <CustomerMenuList selectedCategory={selectedCategory} />
                            </div>
                        )}
                    </main>
                } />
            </Routes>
        </div>
    );
};

const CustomerApp: React.FC = () => {
    return (
        <CustomerCartProvider>
            <CustomerAppContent />
        </CustomerCartProvider>
    );
};

export default CustomerApp;