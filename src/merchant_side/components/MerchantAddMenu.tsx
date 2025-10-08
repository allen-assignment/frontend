import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI } from '../../services/api';

const MerchantAddMenu: React.FC = () => {
    const { state, setCategories, dispatch } = useApp();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        ingredients: '',
        inventory: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Load categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                
                // If categories already exist in global state, use them directly
                if (state.categories && state.categories.length > 0) {
                    // Set default category
                    if (!formData.category_id) {
                        setFormData(prev => ({
                            ...prev,
                            category_id: state.categories[0].id.toString()
                        }));
                    }
                    setLoadingCategories(false);
                    return;
                }
                
                // Otherwise fetch category data from API
                const response = await menuAPI.getAllMenuItems(1); // Default merchant ID is 1
                
                // Extract unique categories from menu data
                const categoryMap = new Map();
                response.menuItems.forEach((item: any) => {
                    if (item.category && !categoryMap.has(item.category.id)) {
                        categoryMap.set(item.category.id, {
                            id: item.category.id,
                            name: item.category.name
                        });
                    }
                });
                const uniqueCategories = Array.from(categoryMap.values());
                
                // Set category data to global state
                setCategories(uniqueCategories);
                
                // Set default category
                if (uniqueCategories.length > 0 && !formData.category_id) {
                    setFormData(prev => ({
                        ...prev,
                        category_id: uniqueCategories[0].id.toString()
                    }));
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, [state.categories, formData.category_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate form
            if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.inventory) {
                alert('Please fill in all required fields');
                return;
            }

            // Call API to add menu item
            const response = await menuAPI.addMenuItem({
                category_id: parseInt(formData.category_id),
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                inventory: parseInt(formData.inventory),
                file: selectedFile || undefined,
            });

            
            const menuItem = {
                id: response.id.toString(), 
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category_id: formData.category_id,
                image_url: response.image_url || previewUrl || '',
                ingredients: formData.ingredients.trim() 
                    ? formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
                    : [],
                inventory: parseInt(formData.inventory),
                isAvailable: true
            };

            dispatch({ 
                type: 'ADD_MENU_ITEM', 
                payload: menuItem
            });
            
            // Show success message
            alert('Menu item added successfully!');
            
            // Navigate back to menu management
            navigate('/merchant/menu');
        } catch (error) {
            console.error('Error adding menu item:', error);
            alert('Failed to add menu item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 text-white w-full">
                <div className="py-4">
                    <div className="flex items-center justify-between px-6">
                        <button 
                            className="p-2 hover:bg-gray-700 rounded-lg"
                            onClick={() => navigate('/merchant/menu')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-center">Add Menu Item</h1>
                        <div className="w-10"></div>
                    </div>
                </div>
                <div className="h-px bg-gray-300"></div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 pb-24">
                <div className="max-w-md mx-auto">
                    <form onSubmit={handleSubmit}>
                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Name *
                                </label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Enter menu item name"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Description *
                                </label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Describe the menu item"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Price (¥) *
                                </label>
                                <input 
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Inventory (Stock) *
                                </label>
                                <input 
                                    type="number"
                                    name="inventory"
                                    value={formData.inventory}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Enter available quantity"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the number of items available in stock
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Category *
                                </label>
                                <select 
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                    disabled={loadingCategories}
                                >
                                    {loadingCategories ? (
                                        <option value="">Loading categories...</option>
                                    ) : state.categories.length === 0 ? (
                                        <option value="">No categories available</option>
                                    ) : (
                                        <>
                                            <option value="">Select a category</option>
                                            {state.categories.map(category => (
                                                <option key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                        
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Upload Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Recommended formats: JPG or PNG. Image will be uploaded automatically when you save.
                                </p>
                            </div>

                            {/* Image Preview */}
                            {previewUrl && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">
                                        Image Preview
                                    </label>
                                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={previewUrl}
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
                        <div className="flex gap-3 mt-8">
                            <button 
                                type="button"
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                onClick={() => navigate('/merchant/menu')}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MerchantAddMenu;