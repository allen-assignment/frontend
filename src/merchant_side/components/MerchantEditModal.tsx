import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI } from '../../services/api';

interface MerchantEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: any;
    categories?: { id: number; name: string }[];
}

const MerchantEditModal: React.FC<MerchantEditModalProps> = ({ isOpen, onClose, editingItem, categories = [] }) => {
    const { updateMenuItem, dispatch } = useApp();
    const [formData, setFormData] = useState(editingItem || {});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Debug: Log categories received
    console.log('=== MerchantEditModal Categories Debug ===');
    console.log('categories received:', categories);
    console.log('categories.length:', categories.length);

    // Update formData when editingItem changes
    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    }, [editingItem]);

    if (!isOpen || !editingItem) return null;

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.description?.trim() || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        console.log('=== MerchantEditModal Save Debug ===');
        console.log('Form data:', formData);
        console.log('Category ID:', formData.category_id);
        console.log('Categories available:', categories);

        try {
            const updateData = {
                id: parseInt(formData.id),
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price) || 0,
                inventory: formData.inventory || 0,
                category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
                isAvailable: formData.isAvailable !== false ? 1 : 0,
                file: selectedFile || undefined,
            };
            
            console.log('Update data being sent:', updateData);
            
            await menuAPI.updateMenuItem(updateData);

            // Refresh menu data from API to get latest data
            console.log('Refreshing menu data after update...');
            const response = await menuAPI.getAllMenuItems();
            
            // Convert API data to AppContext format and sort by ID descending
            const convertedItems = response.menuItems
                .map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price.toString()),
                    image_url: item.image_url,
                    category_id: item.category?.id?.toString() || '1',
                    category: item.category ? {
                        id: item.category.id,
                        name: item.category.name
                    } : undefined,
                    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                    inventory: item.inventory || 0
                }))
                .sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by ID in descending order
            
            // Update global state with fresh data
            dispatch({ type: 'SET_MENU_ITEMS', payload: convertedItems });
            dispatch({ type: 'SET_MENU_DATA_LOADED', payload: true });
            
            console.log('Menu data refreshed successfully');
            
            console.log('Update successful');
            onClose();
        } catch (error) {
            console.error('Failed to update menu item:', error);
            alert('Update failed, please try again');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'price' ? value : value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('File input changed:', e.target.files);
        const file = e.target.files && e.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            console.log('No file selected');
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };


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
                            {categories.length === 0 ? (
                                <option value="">No categories available</option>
                            ) : (
                                <>
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            onClick={() => console.log('File input clicked')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            style={{ cursor: 'pointer' }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Image will be previewed after selection and uploaded when saved.</p>
                    </div>

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
                    {(previewUrl || formData.image_url) && (
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">Image Preview</label>
                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={previewUrl || formData.image_url}
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