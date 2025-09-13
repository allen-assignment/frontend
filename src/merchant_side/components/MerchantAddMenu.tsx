import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../shared/context/AppContext';

const MerchantAddMenu: React.FC = () => {
    const { addMenuItem } = useApp();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: 'pizza',
        image_url: '',
        ingredients: '',
        inventory: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

            // Create menu item
            const menuItem = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category_id: formData.category_id,
                image_url: formData.image_url.trim() || undefined,
                ingredients: formData.ingredients.trim() 
                    ? formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
                    : [],
                inventory: parseInt(formData.inventory),
                isAvailable: true
            };

            addMenuItem(menuItem);
            
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

    const categories = [
        { value: 'pizza', label: 'Pizza' },
        { value: 'pasta', label: 'Pasta' },
        { value: 'salad', label: 'Salad' },
        { value: 'appetizer', label: 'Appetizer' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'beverage', label: 'Beverage' }
    ];

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 text-white w-full">
                <div className="py-4">
                    <div className="flex items-center justify-between px-4">
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
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Ingredients
                                </label>
                                <input 
                                    type="text"
                                    name="ingredients"
                                    value={formData.ingredients}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="Comma-separated ingredients (e.g., tomato, cheese, basil)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Separate multiple ingredients with commas
                                </p>
                            </div> */}
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    Image URL
                                </label>
                                <input 
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional: Enter a URL for the menu item image
                                </p>
                            </div>

                            {/* Image Preview */}
                            {formData.image_url && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">
                                        Image Preview
                                    </label>
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