import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CustomerCartProvider } from './context/CustomerCartContext';
import { useApp } from '../shared/context/AppContext';
import CustomerHeader from './components/CustomerHeader';
import CustomerMenuList from './components/CustomerMenuList';
import CustomerCart from './components/CustomerCart';
import CustomerWelcomeModal from './components/CustomerWelcomeModal';
import CustomerPopularItems from './components/CustomerPopularItems';
import Profile from '../pages/profile/Profile';
import PersonalInfo from '../pages/userInfo/PersonalInfo';
import EditField from '../edit/EditField';

const CustomerAppContent: React.FC = () => {
    const { setCurrentTable, state } = useApp();
    const location = useLocation();
    
    // Get merchant ID and table number from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const merchantId = urlParams.get('merchant_id');
    const tableNumber = urlParams.get('table');
    
    // Initialize: always show Welcome Modal on first visit, hide menu
    // Menu will only show after user clicks "Start Ordering"
    const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        const hasToken = localStorage.getItem('jwt_token');
        // If has token and has seen welcome page, don't show Welcome Modal
        if (hasToken && hasSeenWelcome) {
            return false;
        }
        // In other cases, show welcome page
        return true;
    });
    const [showMenu, setShowMenu] = useState(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        const hasToken = localStorage.getItem('jwt_token');
        // Only show menu if has token and has seen welcome page
        return !!(hasToken && hasSeenWelcome);
    });
    // Use login state from AppContext
    const isLogin = state.isLoggedIn;

    // Set table number: prioritize URL parameter, otherwise generate random table number
    useEffect(() => {
        if (tableNumber) {
            setCurrentTable(tableNumber);
        } else if (!state.currentTable) {
            const randomTable = Math.floor(Math.random() * 20) + 1;
            setCurrentTable(randomTable.toString());
        }
    }, [setCurrentTable, state.currentTable, tableNumber]);

    // Listen for login state changes, reset welcome page when user logs out
    useEffect(() => {
        console.log('Login state change:', { isLogin, showWelcomeModal, showMenu });
        
        // If user logs out, always show welcome page
        if (!isLogin) {
            setShowWelcomeModal(true);
            setShowMenu(false);
        } else {
            // User is logged in, decide display content based on hasSeenWelcome
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (hasSeenWelcome) {
                console.log('User logged in and has seen welcome page, show menu');
                setShowWelcomeModal(false);
                setShowMenu(true);
            } else {
                console.log('User logged in but has not seen welcome page, show welcome page');
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
    console.log('Render state:', { showWelcomeModal, showMenu, shouldShowHeader: showMenu && !showWelcomeModal });

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