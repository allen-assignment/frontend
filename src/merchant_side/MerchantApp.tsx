import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MerchantDashboard from './components/MerchantDashboard';
import MerchantMenuManagement from './components/MerchantMenuManagement';
import MerchantAddMenu from './components/MerchantAddMenu';
import MerchantMembers from './components/MerchantMembers';
import MerchantOCR from './components/MerchantOCR';
import MerchantBottomNavigation from './components/MerchantBottomNavigation';

const MerchantApp: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Main Content */}
            <Routes>
                {/* Dashboard */}
                <Route path="/" element={
                    <>
                        <div className="bg-gray-800 text-white w-full">
                            <div className="py-4">
                                <h1 className="text-xl font-bold text-center">Merchant Dashboard</h1>
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