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

const CustomerAppContent: React.FC = () => {
    const { setCurrentTable, state } = useApp();
    // Initialize by checking localStorage state
    const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        return !hasSeenWelcome;
    });
    const [showMenu, setShowMenu] = useState(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        return !!hasSeenWelcome;
    });
    // Use login state from AppContext
    const isLogin = state.isLoggedIn;

    // Generate random table number for demo
    useEffect(() => {
        if (!state.currentTable) {
            const randomTable = Math.floor(Math.random() * 20) + 1;
            setCurrentTable(randomTable.toString());
        }
    }, [setCurrentTable, state.currentTable]);

    // Listen for login state changes, reset welcome page when user logs out
    useEffect(() => {
        console.log('🔍 登录状态变化:', { isLogin, showWelcomeModal, showMenu });
        
        // If user logs out, always show welcome page
        if (!isLogin) {
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            console.log('👤 用户已登出，检查欢迎页面状态:', { hasSeenWelcome });
            
            // After logout, if haven't seen welcome page, show welcome page
            if (!hasSeenWelcome) {
                console.log('📱 显示欢迎页面，隐藏导航栏');
                setShowWelcomeModal(true);
                setShowMenu(false);
            } else {
                // If already seen welcome page, also show welcome page (should re-display after Reset)
                console.log('📱 Reset后重新显示欢迎页面');
                setShowWelcomeModal(true);
                setShowMenu(false);
            }
        } else {
            // User is logged in, decide display content based on hasSeenWelcome
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (hasSeenWelcome) {
                console.log('📱 用户已登录且看过欢迎页面，显示菜单');
                setShowWelcomeModal(false);
                setShowMenu(true);
            } else {
                console.log('📱 用户已登录但未看过欢迎页面，显示欢迎页面');
                setShowWelcomeModal(true);
                setShowMenu(false);
            }
        }
    }, [isLogin]);

    const handleWelcomeClose = () => {
        setShowWelcomeModal(false);
        setShowMenu(true);
        // Remember user has seen welcome page
        localStorage.setItem('hasSeenWelcome', 'true');
    };

    // Debug info
    console.log('🎨 渲染状态:', { showWelcomeModal, showMenu, shouldShowHeader: showMenu && !showWelcomeModal });

    return (
        <div className="min-h-screen bg-white">
            
            {/* Welcome Modal */}
            <CustomerWelcomeModal 
                isOpen={showWelcomeModal} 
                onClose={handleWelcomeClose} 
            />
            
            {/* Header - Show when menu is visible and welcome modal is closed */}
            {showMenu && !showWelcomeModal && (
                <CustomerHeader showLoginButtons={true} isLoggedIn={isLogin} />
            )}
            
            {/* Main Content */}
            <Routes>
                <Route path="/cart" element={<CustomerCart />} />
                <Route path="/profile" element={<Profile userId={state.currentUser?.id} />} />
                <Route path="/personal-info" element={<PersonalInfo />} />
                <Route path="/edit/:field" element={<EditField />} />
                
                <Route path="/" element={
                    <main className={showMenu && !showWelcomeModal ? "pt-16" : ""}>
                        {showMenu && !showWelcomeModal && (
                            <div className="container mx-auto px-4">
                                {/* Popular Items Section */}
                                <CustomerPopularItems />
                                
                                
                                {/* Menu List */}
                                <CustomerMenuList />
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