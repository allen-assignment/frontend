import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, FileText, Edit, Save, X, Plus, Trash2, Image } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { ocrAPI, OCRResponse, OCRMenuItem, menuAPI } from '../../services/api';

interface OCRResult {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isConfirmed: boolean;
}

const MerchantOCR: React.FC = () => {
  const { addMenuItem } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [editingItem, setEditingItem] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string; description: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载分类数据
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await menuAPI.getAllCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('加载分类失败:', error);
      setError('无法加载分类数据，请检查网络连接');
    } finally {
      setLoadingCategories(false);
    }
  };

  // 组件挂载时加载分类
  useEffect(() => {
    loadCategories();
  }, []);

  // 解析 OCR API 返回的结果
  const parseOCRResults = (ocrData: OCRResponse): OCRResult[] => {
    const results: OCRResult[] = [];
    
    // 检查API响应是否成功
    if (!ocrData.ok || !ocrData.items) {
      console.error('OCR API 返回错误:', ocrData.error);
      return results;
    }
    
    // 解析backend OCR API返回的菜单项
    ocrData.items.forEach((item: OCRMenuItem, index: number) => {
      if (item.name && item.name.trim().length > 0) {
        results.push({
          id: `backend_ocr_${index}`,
          name: item.name.trim(),
          price: item.price || 0,
          description: item.description || `从图片中识别的菜单项: ${item.name}`,
          category: item.category || (categories.length > 0 ? categories[0].name : ''),
          isConfirmed: false
        });
      }
    });
    
    return results;
  };


  // 真实的 OCR API 调用函数 - 使用新的backend OCR API
  const callOCRAPI = async (imageData: string | File) => {
    try {
      // 如果已经是File对象，直接使用
      if (imageData instanceof File) {
        const result = await ocrAPI.uploadMenuImage(imageData);
        return result;
      }
      
      // 将base64数据转换为File对象
      let file: File;
      
      if (imageData.startsWith('data:')) {
        // 从base64数据创建File对象
        const response = await fetch(imageData);
        const blob = await response.blob();
        file = new File([blob], 'menu.jpg', { type: blob.type });
      } else if (imageData.startsWith('/')) {
        // 从URL路径获取图片并创建File对象
        const response = await fetch(imageData);
        const blob = await response.blob();
        file = new File([blob], 'menu.jpg', { type: blob.type });
      } else {
        throw new Error('不支持的图片格式');
      }
      
      // 调用新的backend OCR API
      const result = await ocrAPI.uploadMenuImage(file);
      return result;
    } catch (error) {
      console.error('Backend OCR API Error:', error);
      throw error;
    }
  };

  // OCR 处理函数 - API
  const processImage = async () => {
    console.log('🔍 processImage 函数被调用');
    const fileToProcess = selectedFile || uploadedImage;
    console.log('📸 处理图片:', fileToProcess);
    
    if (!fileToProcess) {
      console.warn('⚠️ 没有选择的图片');
      setError('请先选择图片');
      return;
    }

    console.log('🚀 开始OCR识别...');
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔍 开始OCR识别...');
      // 调用真实的 OCR API
      const ocrResult = await callOCRAPI(fileToProcess);
      console.log('📊 OCR API 原始响应:', ocrResult);
      
      // 处理 API 返回的结果
      const extractedItems = parseOCRResults(ocrResult);
      console.log('✅ 解析后的识别结果:', extractedItems);
      
      if (extractedItems.length > 0) {
        console.log(`🎉 识别成功！共识别出 ${extractedItems.length} 个菜品`);
        setOcrResults(extractedItems);
        setShowResults(true);
      } else {
        console.warn('⚠️ 识别结果为空');
        setError('未识别到任何菜品，请尝试其他图片');
      }
    } catch (apiError) {
      console.error('❌ OCR API 调用失败:', apiError);
      setError(`OCR识别失败: ${apiError instanceof Error ? apiError.message : '未知错误'}`);
    } finally {
      console.log('🏁 OCR处理完成');
      setIsProcessing(false);
    }
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

  // 加载本地测试图片
  const handleLoadTestImage = () => {
    // 使用本地的 menu.jpg 图片作为测试
    const testImageUrl = '/menu.jpg';
    setUploadedImage(testImageUrl);
    setShowResults(false);
    setOcrResults([]);
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
    // 根据分类名称找到对应的分类ID
    const category = categories.find(cat => cat.name === item.category);
    
    if (!category) {
      setError(`未找到分类 "${item.category}"，请先编辑菜品选择正确的分类`);
      return;
    }
    
    // Add confirmed item to menu
    addMenuItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: category.id.toString(),
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
      category: categories.length > 0 ? categories[0].name : '',
      isConfirmed: false
    };
    setEditingItem(newItem);
  };


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
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Azure Computer Vision API 已连接</span>
            </div>
          </div>

          {/* Status Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                正在识别图片中的菜品...
              </div>
            </div>
          )}

          {showResults && ocrResults.length > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ 识别成功！共识别出 {ocrResults.length} 个菜品
            </div>
          )}

          {/* Image Upload Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Menu Image</h3>
            
            {!uploadedImage && !imagePreview ? (
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
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Choose Image
                  </button>
                  <button
                    onClick={handleLoadTestImage}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Image className="w-4 h-4 inline mr-2" />
                    Load Test Image
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  支持 JPG、PNG、PDF 格式的菜单图片，或点击"Load Test Image"使用本地测试图片
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview || uploadedImage || ''}
                    alt="Uploaded menu"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      console.log('🔘 Start Recognition 按钮被点击');
                      processImage();
                    }}
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
                  
                  <button
                    onClick={async () => {
                      console.log('🧪 Load Test Image 按钮被点击 - 加载menu.jpg');
                      try {
                        // 直接读取本地的menu.jpg文件
                        const response = await fetch('/menu.jpg');
                        const blob = await response.blob();
                        const file = new File([blob], 'menu.jpg', { type: 'image/jpeg' });
                        
                        // 设置文件到状态
                        setSelectedFile(file);
                        
                        // 创建预览URL
                        const previewUrl = URL.createObjectURL(file);
                        setImagePreview(previewUrl);
                        
                        console.log('✅ menu.jpg 加载成功，请点击 Start Recognition 进行测试');
                        
                        // 显示成功消息
                        alert('测试图片加载成功！现在可以点击 "Start Recognition" 进行OCR测试');
                      } catch (error) {
                        console.error('❌ 加载menu.jpg失败:', error);
                        alert('加载测试图片失败，请检查文件是否存在');
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Load Test Image
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
          loadingCategories={loadingCategories}
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
  categories: { id: number; name: string; description: string }[];
  loadingCategories: boolean;
}> = ({ item, onSave, onCancel, categories, loadingCategories }) => {
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
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option value="">加载分类中...</option>
                ) : categories.length === 0 ? (
                  <option value="">暂无分类数据</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
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