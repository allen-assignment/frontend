import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';
import { menuAPI } from '../../services/api';

const MerchantAddMenu: React.FC = () => {
    const { state, setCategories, loadCategories, dispatch } = useApp();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        ingredients: '',
        inventory: '',
        isAvailable: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    
    // New category dialog state
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // Load categories on component mount - only once
    useEffect(() => {
        const loadCategoriesData = async () => {
            try {
                setLoadingCategories(true);
                
                // If categories already exist in global state, use them directly
                if (state.categories && state.categories.length > 0) {
                    setLoadingCategories(false);
                    return;
                }
                
                // Otherwise fetch category data from API
                await loadCategories();
                
                // If no categories exist, allow manual input
                if (state.categories.length === 0) {
                    console.log('No existing categories found, allowing manual input');
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategoriesData();
    }, []); // Empty dependency array - only run once on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    // Handle creating new category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        try {
            setIsCreatingCategory(true);
            
            const categoryResponse = await menuAPI.addCategory({
                category_name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || `Category for ${newCategoryName.trim()}`
            });
            
            // Validate response
            if (!categoryResponse || !categoryResponse.id) {
                console.error('Server response:', categoryResponse);
                throw new Error('Invalid response from server: missing id');
            }
            
            // Add new category to state
            const newCategory = {
                id: categoryResponse.id,
                name: categoryResponse.category_name
            };
            
            const updatedCategories = [...state.categories, newCategory];
            setCategories(updatedCategories);
            
            // Select the newly created category
            setFormData(prev => ({
                ...prev,
                category_id: categoryResponse.id.toString()
            }));
            
            // Close dialog and reset form
            setShowCategoryDialog(false);
            setNewCategoryName('');
            setNewCategoryDescription('');
            
            // Reload categories to get the latest data
            await loadCategories();
            
            alert('Category created successfully!');
        } catch (error: any) {
            console.error('Error creating category:', error);
            alert(`Failed to create category: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsCreatingCategory(false);
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

            // Validate category
            if (!formData.category_id) {
                alert('Please select a category');
                return;
            }

            // optional
            if (!selectedFile) {
                const confirmed = window.confirm('No image selected. Do you want to continue without an image?');
                if (!confirmed) {
                    return;
                }
            }

            // Call API to add menu item
            const response = await menuAPI.addMenuItem({
                category_id: parseInt(formData.category_id),
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                inventory: parseInt(formData.inventory),
                isAvailable: formData.isAvailable,  // required
                file: selectedFile || undefined,  // optional
            });

            
            // response: { ok: true, message: "...", item_id: number, image_url: string }
            const menuItem = {
                id: response.item_id.toString(), 
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category_id: formData.category_id,
                image_url: response.image_url || '',
                ingredients: formData.ingredients.trim() 
                    ? formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
                    : [],
                inventory: parseInt(formData.inventory),
                isAvailable: formData.isAvailable
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to add menu item: ${errorMessage}`);
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
                                {loadingCategories ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                                        Loading categories...
                                    </div>
                                ) : state.categories.length === 0 ? (
                                    <div>
                                        <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                            <p className="text-gray-600 mb-3">No categories yet</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDialog(true)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                Create First Category
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <select 
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-2"
                                        >
                                            <option value="">Select a category</option>
                                            {state.categories.map(category => (
                                                <option key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryDialog(true)}
                                            className="text-sm text-blue-500 hover:text-blue-600 underline"
                                        >
                                            + Create New Category
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Availability Status *
                                </label>
                                <div className="flex items-center space-x-3">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isAvailable"
                                            checked={formData.isAvailable}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {formData.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Check this box if the item is currently available for ordering
                                </p>
                            </div>
                        
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Upload Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
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

            {/* Create Category Dialog */}
            {showCategoryDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Category</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., Appetizers, Main Course, Desserts"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Brief description of this category"
                                    rows={3}
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryDialog(false);
                                    setNewCategoryName('');
                                    setNewCategoryDescription('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                disabled={isCreatingCategory}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCategory}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isCreatingCategory || !newCategoryName.trim()}
                            >
                                {isCreatingCategory ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantAddMenu;