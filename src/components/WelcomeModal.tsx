import React from 'react';
import { X } from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
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
            
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Table not recognized
            </h2>
            
            <p className="text-gray-600 mb-6">
                Please scan the QR code to start ordering.
            </p>
            
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

export default WelcomeModal;