import React from 'react';
import { X, QrCode } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

interface CustomerWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomerWelcomeModal: React.FC<CustomerWelcomeModalProps> = ({ isOpen, onClose }) => {
    const { state } = useApp();
    
    if (!isOpen) return null;

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
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        Welcome to Smart Order
                    </h2>
                    
                    <p className="text-gray-600 mb-4">
                        You are seated at Table {state.currentTable || '?'}
                    </p>
                    
                    <div className="bg-blue-50 p-3 rounded-lg mb-6">
                        <p className="text-sm text-blue-800">
                            💡 Your orders will be synchronized in real-time with the kitchen
                        </p>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        Start Ordering
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomerWelcomeModal;