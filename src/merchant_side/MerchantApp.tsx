import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useApp } from '../shared/context/AppContext';
import MerchantDashboard from './components/MerchantDashboard';
import MerchantMenuManagement from './components/MerchantMenuManagement';
import MerchantAddMenu from './components/MerchantAddMenu';
import MerchantMembers from './components/MerchantMembers';
import MerchantOCR from './components/MerchantOCR';
import MerchantBottomNavigation from './components/MerchantBottomNavigation';
import MerchantOrderManagement from './components/MerchantOrderManagement';

const MerchantApp: React.FC = () => {
    const navigate = useNavigate();
    const { logout, state } = useApp();

    // Skip permission check, directly show Merchant Dashboard
    useEffect(() => {
        console.log('MerchantApp loaded, directly showing Dashboard:', {
            isLoggedIn: state.isLoggedIn,
            hasCurrentUser: !!state.currentUser,
            usertype: state.currentUser?.usertype,
            merchant_id: state.currentUser?.merchant_id,
            timestamp: new Date().toISOString()
        });
    }, [state.isLoggedIn, state.currentUser]);

    // Directly show Merchant Dashboard without permission check

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Main Content */}
            <Routes>
                {/* Dashboard */}
                <Route path="/" element={
                    <>
                        <div className="bg-gray-800 text-white w-full">
                            <div className="py-4 px-6 flex items-center justify-between">
                                <div className="w-20"></div>
                                <h1 className="text-xl font-bold text-center flex-1">Merchant Dashboard</h1>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-200 transition-colors border border-gray-400 rounded-md hover:bg-gray-700 w-20 justify-end"
                                    onClick={() => {
                                        // Clear user login state
                                        logout();
                                        // Reset welcome page state
                                        localStorage.removeItem('hasSeenWelcome');
                                        // Navigate to welcome page
                                        navigate('/');
                                    }}
                                    title="Reset to Welcome Page"
                                >
                                    <Store size={16} />
                                    Reset
                                </button>
                            </div>
                            <div className="h-px bg-gray-300"></div>
                        </div>
                        <div className="px-6 py-6 pb-24">
                            <div className="max-w-4xl mx-auto">
                                <MerchantDashboard />
                            </div>
                        </div>
                    </>
                } />

                {/* Menu Management */}
                <Route path="/menu" element={<MerchantMenuManagement />} />
                
                {/* Add Menu Item */}
                <Route path="/menu/add" element={<MerchantAddMenu />} />

                {/* Members Management
                <Route path="/members" element={<MerchantMembers />} /> */}

                {/* Orders Management */}
                <Route path="/orders" element={<MerchantOrderManagement />} />
                
                {/* OCR Menu Recognition */}
                <Route path="/ocr" element={<MerchantOCR />} />
            </Routes>

            {/* Bottom Navigation */}
            <MerchantBottomNavigation />
        </div>
    );
};

export default MerchantApp;