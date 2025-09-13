import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

interface OCRResult {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  confidence: number;
  isConfirmed: boolean;
}

const MerchantOCR: React.FC = () => {
  const { addMenuItem } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [editingItem, setEditingItem] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock OCR processing - in real app, this would call an OCR API
  const processImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR results
    const mockResults: OCRResult[] = [
      {
        id: '1',
        name: 'Margherita Pizza',
        price: 68,
        description: 'Fresh tomato sauce with mozzarella cheese and basil',
        category: 'pizza',
        confidence: 0.95,
        isConfirmed: false
      },
      {
        id: '2',
        name: 'Hawaiian Pizza',
        price: 72,
        description: 'Tomato sauce, ham, pineapple, and mozzarella',
        category: 'pizza',
        confidence: 0.88,
        isConfirmed: false
      },
      {
        id: '3',
        name: 'Caesar Salad',
        price: 45,
        description: 'Fresh romaine lettuce with caesar dressing',
        category: 'salad',
        confidence: 0.92,
        isConfirmed: false
      }
    ];

    setOcrResults(mockResults);
    setShowResults(true);
    setIsProcessing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setShowResults(false);
        setOcrResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditItem = (item: OCRResult) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (editedItem: OCRResult) => {
    setOcrResults(prev => 
      prev.map(item => 
        item.id === editedItem.id ? { ...editedItem, isConfirmed: true } : item
      )
    );
    setEditingItem(null);
  };

  const handleConfirmItem = (item: OCRResult) => {
    // Add confirmed item to menu
    addMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category,
      ingredients: [],
      isAvailable: true
    });

    // Mark as confirmed
    setOcrResults(prev => 
      prev.map(result => 
        result.id === item.id ? { ...result, isConfirmed: true } : result
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setOcrResults(prev => prev.filter(item => item.id !== id));
  };

  const handleAddCustomItem = () => {
    const newItem: OCRResult = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      description: '',
      category: 'pizza',
      confidence: 1.0,
      isConfirmed: false
    };
    setEditingItem(newItem);
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
          <h1 className="text-xl font-bold text-center">OCR Menu Recognition</h1>
        </div>
        <div className="h-px bg-gray-300"></div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 pb-24">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">OCR Menu Recognition</h1>
            <p className="text-gray-600 mt-2">Automatically extract menu information from photos</p>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Menu Image</h3>
            
            {!uploadedImage ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Upload a clear photo of your menu for automatic text recognition
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded menu"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 inline mr-2" />
                        Start Recognition
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Change Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {showResults && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recognition Results</h3>
                <button
                  onClick={handleAddCustomItem}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Item
                </button>
              </div>
              
              <div className="space-y-4">
                {ocrResults.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                            item.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Price: ¥{item.price}</span>
                          <span>Category: {item.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!item.isConfirmed ? (
                          <>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleConfirmItem(item)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Confirm
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md">
                            ✓ Confirmed
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {ocrResults.filter(item => item.isConfirmed).length} of {ocrResults.length} items confirmed
                  </div>
                  <button
                    onClick={() => {
                      const confirmedItems = ocrResults.filter(item => item.isConfirmed);
                      if (confirmedItems.length > 0) {
                        alert(`Successfully added ${confirmedItems.length} items to menu!`);
                        setShowResults(false);
                        setUploadedImage(null);
                        setOcrResults([]);
                      }
                    }}
                    disabled={ocrResults.filter(item => item.isConfirmed).length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">📋 How to Use OCR</h3>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>1. <strong>Take a clear photo</strong> of your menu in good lighting</p>
              <p>2. <strong>Upload the image</strong> using the button above</p>
              <p>3. <strong>Review results</strong> and edit if needed</p>
              <p>4. <strong>Confirm items</strong> to add them to your menu</p>
              <p>5. <strong>Complete import</strong> to finish the process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
          categories={categories}
        />
      )}
    </div>
  );
};

// Edit Item Modal Component
const EditItemModal: React.FC<{
  item: OCRResult;
  onSave: (item: OCRResult) => void;
  onCancel: () => void;
  categories: { value: string; label: string }[];
}> = ({ item, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState(item);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = () => {
    if (formData.name.trim() && formData.description.trim() && formData.price > 0) {
      onSave(formData);
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Edit Menu Item</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Price (¥) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
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
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantOCR; 