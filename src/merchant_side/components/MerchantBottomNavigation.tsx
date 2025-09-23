import React from 'react';
import { BarChart3, Users, Store, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MerchantBottomNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/merchant' && location.pathname === '/merchant') return true;
        if (path !== '/merchant' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        {
            path: '/merchant',
            icon: BarChart3,
            label: 'Dashboard'
        },
        {
            path: '/merchant/menu',
            icon: Store,
            label: 'Menu'
        },
        {
            path: '/merchant/ocr',
            icon: Camera,
            label: 'OCR'
        },
        {
            path: '/merchant/members',
            icon: Users,
            label: 'Members'
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 w-full">
            <div className="flex justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                        <button
                            key={item.path}
                            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                                active ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MerchantBottomNavigation;