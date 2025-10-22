import React, { useState, useEffect } from 'react';
import { X, QrCode, Store } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface CustomerWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerWelcomeModal: React.FC<CustomerWelcomeModalProps> = ({ isOpen, onClose }) => {
    const { state } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get merchant ID from URL or default to 1
    const urlParams = new URLSearchParams(location.search);
    const urlMerchantId = urlParams.get('merchant_id');
    
    // State for merchant ID input
    const [merchantId, setMerchantId] = useState<string>(urlMerchantId || '1');
    
    // Update merchant ID when URL changes
    useEffect(() => {
        if (urlMerchantId) {
            setMerchantId(urlMerchantId);
        }
    }, [urlMerchantId]);
    
    if (!isOpen) return null;

    const handleStartOrdering = () => {
        // Update URL with merchant ID
        const newParams = new URLSearchParams(location.search);
        newParams.set('merchant_id', merchantId);
        navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
        onClose();
    };

    const handleMerchantView = () => {
        // Navigate to merchant login page
        navigate('/merchant/login');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full animate-slide-up">
                <div className="p-4 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="px-6 pb-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Welcome to Smart Order
                    </h2>
                    
                    {/* Merchant ID Input */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <label htmlFor="merchantId" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Merchant ID:
                            </label>
                            <input
                                id="merchantId"
                                type="number"
                                min="1"
                                value={merchantId}
                                onChange={(e) => setMerchantId(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter merchant ID"
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-left">
                            Default is Merchant 1, you can change to another merchant ID
                        </p>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                        You are seated at Table <span className="font-semibold text-gray-800">{state.currentTable || '?'}</span>
                    </p>
                    
                    {/* Button group */}
                    <div className="space-y-3">
                        <button
                            onClick={handleStartOrdering}
                            className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        >
                            Start Ordering
                        </button>
                        
                        <button
                            onClick={handleMerchantView}
                            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Store size={18} />
                            Merchant Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerWelcomeModal;