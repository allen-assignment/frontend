import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerCartProvider } from './context/CustomerCartContext';
import { useApp } from '../shared/context/AppContext';
import CustomerHeader from './components/CustomerHeader';
import CustomerMenuList from './components/CustomerMenuList';
import CustomerCart from './components/CustomerCart';
import CustomerWelcomeModal from './components/CustomerWelcomeModal';
import CustomerPopularItems from './components/CustomerPopularItems';

// 分类定义
const categories = [
    { category_id: 'all', name: 'All' },
    { category_id: 'pizza', name: 'Pizza' },
    { category_id: 'pasta', name: 'Pasta' },
    { category_id: 'salad', name: 'Salad' },
    { category_id: 'appetizer', name: 'Appetizer' },
    { category_id: 'dessert', name: 'Dessert' },
    { category_id: 'beverage', name: 'Beverage' }
];

const CustomerAppContent: React.FC = () => {
    const { setCurrentTable, state } = useApp();
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLogin, setIsLogin] = useState(false);

    // Generate random table number for demo
    useEffect(() => {
        if (!state.currentTable) {
            const randomTable = Math.floor(Math.random() * 20) + 1;
            setCurrentTable(randomTable.toString());
        }
    }, [setCurrentTable, state.currentTable]);

    const handleWelcomeClose = () => {
        setShowWelcomeModal(false);
        setShowMenu(true);
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
                                                    {category.name}
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