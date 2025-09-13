import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import MerchantDashboard from './components/MerchantDashboard';
import MerchantMenuManagement from './components/MerchantMenuManagement';
import MerchantAddMenu from './components/MerchantAddMenu';
import MerchantMembers from './components/MerchantMembers';
import MerchantOCR from './components/MerchantOCR';
import MerchantBottomNavigation from './components/MerchantBottomNavigation';

const MerchantApp: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Main Content */}
            <Routes>
                {/* Dashboard */}
                <Route path="/" element={
                    <>
                        <div className="bg-gray-800 text-white w-full">
                            <div className="py-4 px-4 flex items-center justify-between">
                                <h1 className="text-xl font-bold">Merchant Dashboard</h1>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-200 transition-colors border border-gray-400 rounded-md hover:bg-gray-700"
                                    onClick={() => navigate('/customer')}
                                    title="Switch to Customer Mode"
                                >
                                    <Store size={16} />
                                    Customer View
                                </button>
                            </div>
                            <div className="h-px bg-gray-300"></div>
                        </div>
                        <div className="px-4 py-6 pb-24">
                            <MerchantDashboard />
                        </div>
                    </>
                } />

                {/* Menu Management */}
                <Route path="/menu" element={<MerchantMenuManagement />} />
                
                {/* Add Menu Item */}
                <Route path="/menu/add" element={<MerchantAddMenu />} />

                {/* Members Management */}
                <Route path="/members" element={<MerchantMembers />} />
                
                {/* OCR Menu Recognition */}
                <Route path="/ocr" element={<MerchantOCR />} />
            </Routes>

            {/* Bottom Navigation */}
            <MerchantBottomNavigation />
        </div>
    );
};

export default MerchantApp;