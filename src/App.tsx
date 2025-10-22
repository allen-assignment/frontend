import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import { CustomerCartProvider } from './customer_side/context/CustomerCartContext';
import CustomerApp from './customer_side/CustomerApp';
import MerchantApp from './merchant_side/MerchantApp';
import CustomerHeader from './customer_side/components/CustomerHeader';
import LoginPage from './pages/login';
import './index.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <CustomerCartProvider>
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={
            <div className="min-h-screen bg-white">
              <div className="login-page-container no-header">
                <LoginPage />
              </div>
            </div>
          } />
          
          {/* Customer */}
          <Route path="/customer/*" element={<CustomerApp />} />
          
          {/* Merchant Login */}
          <Route path="/merchant/login" element={
            <div className="min-h-screen bg-white">
              <div className="login-page-container no-header">
                <LoginPage />
              </div>
            </div>
          } />
          
          {/* Merchant App - All merchant routes except login */}
          <Route path="/merchant/*" element={<MerchantApp />} />
        
        {/* Default */}
        <Route path="/" element={<CustomerApp />} />
        
        {/* Other unmatched routes redirect to customer page */}
        <Route path="*" element={<CustomerApp />} />
      </Routes>
      </CustomerCartProvider>
    </AppProvider>
  );
};

export default App;