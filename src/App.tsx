import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { MenuItem as MenuItemType } from './context/CartContext';
import Header  from './components/Header';
import MenuList from './components/MenuList';
import Cart from './components/Cart';
import { PopularItems } from './components/PopularItems';
import WelcomeModal from './components/WelcomeModal';
import { categories } from './data/menuData';
import {useNavigate, Routes, Route} from 'react-router-dom';
import axios from 'axios';

import './index.css';

const AppContent: React.FC = () => {
  const { setTableNumber, state } = useCart();

  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Generate random table number for demo
  useEffect(() => {
      if (!state.tableNumber) {
        const randomTable = Math.floor(Math.random() * 20) + 1;
        setTableNumber(randomTable.toString());
      }
  }, [setTableNumber, state.tableNumber]);

  const [menuData, setMenuData] = useState<MenuItemType[]>([]);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const result = await axios.get('http://localhost:8000/menu/items/');
        console.log('API返回的原始数据:', result.data);
        // 转换数据格式
        const items = (result.data.menuItems || []).map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          price: parseFloat(item.price),
          image_url: item.image_url,
          category_id: item.category.id.toString()
        }));
        console.log('处理后的菜单数据:', items);
        setMenuData(items);
      } catch (error) {
        console.error("获取菜单数据失败:", error);
      }
    };
    fetchMenuItem();
  }, []);

  

  // 用于调试
  useEffect(() => {
    console.log('当前菜单数据:', menuData);
  }, [menuData]);

  return (
      <div className="min-h-screen bg-white">
        {/* Welcome Modal */}
        <WelcomeModal 
          isOpen={showWelcomeModal} 
          onClose={() => {
            setShowWelcomeModal(false);
            setShowMenu(true);
          }} 
        />
        
        {/* Header - Show when menu is visible or on cart page */}
        {(showMenu) && (
          <Header showLoginButtons={true} />
        )}
        
        {/* Main Content */}
        <Routes>
          <Route path="/cart" element={ <Cart /> } />
          <Route path="/" element={
              <main className={showMenu ? "pt-16" : ""}>
                {showMenu && (
                  <div className="container mx-auto px-4">
                    {/* Popular Items Section */}
                      <PopularItems />
                    
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
                  <MenuList selectedCategory={selectedCategory} menuData={menuData} />
                </div>
              )}
            </main>
          } />
        </Routes>
      </div>
  );
};

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;