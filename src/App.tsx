import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import { CustomerCartProvider } from './customer_side/context/CustomerCartContext';
import CustomerApp from './customer_side/CustomerApp';
import MerchantApp from './merchant_side/MerchantApp';
import CustomerHeader from './customer_side/components/CustomerHeader';
import LoginPage from './pages/login';
import './index.css';

function App() {
  return (
    <AppProvider>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={
          <CustomerCartProvider>
            <div className="min-h-screen bg-white">
              <CustomerHeader showLoginButtons={true} isLoggedIn={false} />
              <div className="login-page-container">
                <LoginPage onToggle={() => {}} />
              </div>
            </div>
          </CustomerCartProvider>
        } />
        
        {/* Customer 端路由 */}
        <Route path="/customer/*" element={<CustomerApp />} />
        
        {/* Merchant 端路由 */}
        <Route path="/merchant/*" element={<MerchantApp />} />
        
        {/* 默认路由 - 显示客户页面 */}
        <Route path="/" element={<CustomerApp />} />
        
        {/* 其他未匹配的路由重定向到客户页面 */}
        <Route path="*" element={<CustomerApp />} />
      </Routes>
    </AppProvider>
  );
}

export default App;