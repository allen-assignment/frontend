import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

interface MerchantEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: any;
}

const MerchantEditModal: React.FC<MerchantEditModalProps> = ({ isOpen, onClose, editingItem }) => {
    const { updateMenuItem } = useApp();
    const [formData, setFormData] = useState(editingItem || {});

    // Update formData when editingItem changes
    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
        }
    }, [editingItem]);

    if (!isOpen || !editingItem) return null;

    const handleSave = () => {
        if (!formData.name?.trim() || !formData.description?.trim() || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        updateMenuItem({
            ...formData,
            price: parseFloat(formData.price) || 0
        });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'price' ? value : value
        }));
    };

    const categories = [
        { value: 'pizza', label: 'Pizza' },
        { value: 'pasta', label: 'Pasta' },
        { value: 'salad', label: 'Salad' },
        { value: 'appetizer', label: 'Appetizer' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'beverage', label: 'Beverage' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Edit Menu Item</h2>
                    <button 
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Name *</label>
                        <input 
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Enter menu item name"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Description *</label>
                        <textarea 
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Describe the menu item"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Price (¥) *</label>
                        <input 
                            type="number"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Category *</label>
                        <select 
                            name="category_id"
                            value={formData.category_id || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Image URL</label>
                        <input 
                            type="url"
                            name="image_url"
                            value={formData.image_url || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Ingredients</label>
                        <input 
                            type="text"
                            name="ingredients"
                            value={formData.ingredients?.join(', ') || ''}
                            onChange={(e) => {
                                const ingredients = e.target.value.split(',').map(ing => ing.trim()).filter(Boolean);
                                setFormData((prev: any) => ({
                                    ...prev,
                                    ingredients
                                }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Comma-separated ingredients"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate multiple ingredients with commas
                        </p>
                    </div> */}

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isAvailable"
                            name="isAvailable"
                            checked={formData.isAvailable !== false}
                            onChange={(e) => {
                                setFormData((prev: any) => ({
                                    ...prev,
                                    isAvailable: e.target.checked
                                }));
                            }}
                            className="mr-2"
                        />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                            Available for ordering
                        </label>
                    </div>

                    {/* Image Preview */}
                    {formData.image_url && (
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">Image Preview</label>
                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button 
                        type="button"
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MerchantEditModal;