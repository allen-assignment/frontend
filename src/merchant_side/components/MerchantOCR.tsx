import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, FileText, Edit, X, Trash2, Image } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { ocrAPI, menuAPI } from '../../services/api';

interface OCRResult {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  // Extended fields to support complete menu item data
  tags?: string[];
  inventory?: number;
  image_url?: string;
  isAvailable?: boolean;
  feature_one?: string;
  feature_two?: string;
  feature_three?: string;
}

const MerchantOCR: React.FC = () => {
  const { dispatch, state } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [originalOcrResults, setOriginalOcrResults] = useState<OCRResult[]>([]); // Store original OCR results for comparison
  const [showResults, setShowResults] = useState(false);
  const [editingItem, setEditingItem] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string; description: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load category data from categories API
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      // Check token existence (backend will auto extract merchant_id from token)
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log('Token not found, waiting for login...');
        setLoadingCategories(false);
        return;
      }
      
      // Get categories directly from categories API
      const response = await menuAPI.getCategories();
      console.log('Loaded categories from API:', response.categories);
      
      // Convert MenuCategory to the expected format
      const convertedCategories = response.categories.map(cat => ({
        id: cat.id,
        name: cat.category_name,
        description: cat.description || `Category for ${cat.category_name} items`
      }));
      
      setCategories(convertedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Unable to load category data, please check network connection');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };


  // Clear OCR data when merchant ID changes
  useEffect(() => {
    if (state.currentUser?.merchant_id) {
      // Clear OCR-related state
      setOcrResults([]);
      setOriginalOcrResults([]);
      setShowResults(false);
      setUploadedImage(null);
      setImagePreview(null);
      setSelectedFile(null);
      setPreviewId(null);
      setError(null);
      setIsCompleting(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state.currentUser?.merchant_id]);

  // Parse OCR API returned results
  const parseOCRResults = (ocrData: any): OCRResult[] => {
    const results: OCRResult[] = [];
    
    console.log('Parsing OCR data:', ocrData);
    
    // Check if API response is successful - adapt to actual returned data structure
    if (!ocrData || !ocrData.items || !Array.isArray(ocrData.items)) {
      console.error('OCR API returned error or incorrect data format:', ocrData);
      return results;
    }
    
    // Parse menu items returned by backend OCR API
    ocrData.items.forEach((item: any, index: number) => {
      console.log(`Processing menu item ${index}:`, item);
      
      // Check if required fields exist, support multiple possible field names
      const itemName = item.name || item.item_name || item.title || item.dish_name;
      const itemPrice = item.price || item.item_price || item.cost || 0;
      const itemDescription = item.description || item.desc || item.details || '';
      const itemCategory = item.category || item.category_name || item.type || '';
      
      if (itemName && itemName.trim().length > 0) {
        results.push({
          id: `backend_ocr_${index}`,
          name: itemName.trim(),
          price: parseFloat(itemPrice) || 0,
          description: itemDescription || `Menu item recognized from image: ${itemName}`,
          category: itemCategory || 'UNCATEGORIZED',
          // Initialize all extended fields
          tags: item.tags || [],
          inventory: item.inventory || 10,
          image_url: item.image_url || "",
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          feature_one: item.feature_one || "",
          feature_two: item.feature_two || "",
          feature_three: item.feature_three || ""
        });
        console.log(`Successfully added menu item: ${itemName}`);
      } else {
        console.warn(`Skipping invalid menu item ${index} (missing name):`, item);
      }
    });
    
    console.log(`Parsing completed, identified ${results.length} valid menu items`);
    return results;
  };


  // Real OCR API call function - using new backend OCR API
  const callOCRAPI = async (imageData: string | File) => {
    try {
      // If already a File object, use directly
      if (imageData instanceof File) {
        const result = await ocrAPI.uploadMenuImage(imageData);
        return result;
      }
      
      // Convert base64 data to File object
      let file: File;
      
      if (imageData.startsWith('data:')) {
        // Create File object from base64 data
        const response = await fetch(imageData);
        const blob = await response.blob();
        file = new File([blob], 'menu.jpg', { type: blob.type });
      } else if (imageData.startsWith('/')) {
        // Get image from URL path and create File object
        const response = await fetch(imageData);
        const blob = await response.blob();
        file = new File([blob], 'menu.jpg', { type: blob.type });
      } else {
        throw new Error('Unsupported image format');
      }
      
      // Call new backend OCR API
      const result = await ocrAPI.uploadMenuImage(file);
      return result;
    } catch (error) {
      console.error('Backend OCR API Error:', error);
      throw error;
    }
  };

  // OCR processing function - API
  const processImage = async () => {
    console.log('processImage function called');
    console.log('Processing image - selectedFile:', selectedFile, 'uploadedImage:', uploadedImage);
    
    if (!selectedFile && !uploadedImage) {
      console.warn('No image selected');
      setError('Please select an image first');
      return;
    }

    console.log('Starting OCR recognition...');
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Starting OCR recognition...');
      // Call OCR API
      const fileToProcess = selectedFile || uploadedImage;
      if (!fileToProcess) {
        setError('Unable to get image file to process');
        return;
      }
      const ocrResult = await callOCRAPI(fileToProcess);
      console.log('OCR API raw response:', ocrResult);
      
      // Save preview_id
      if (ocrResult.preview_id) {
        setPreviewId(ocrResult.preview_id);
        console.log('Saved preview_id:', ocrResult.preview_id);
      }
      
      // Process API returned results
      const extractedItems = parseOCRResults(ocrResult);
      console.log('Parsed recognition results:', extractedItems);
      
      if (extractedItems.length > 0) {
        console.log(`Recognition successful! Identified ${extractedItems.length} dishes`);
        setOcrResults(extractedItems);
        setOriginalOcrResults([...extractedItems]); // Store original results for comparison
        setShowResults(true);
        
        // Load categories for editing (only if not already loaded)
        if (categories.length === 0) {
          console.log('Loading categories for editing...');
          loadCategories();
        }
      } else {
        console.warn('Recognition results are empty');
        setError('No dishes recognized, please try another image');
      }
    } catch (apiError) {
      console.error('OCR API call failed:', apiError);
      setError(`OCR recognition failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
    } finally {
      console.log('OCR processing completed');
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called');
    console.log('event.target.files:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        console.log('Image data URL created, length:', imageDataUrl.length);
        setUploadedImage(imageDataUrl);
        setImagePreview(imageDataUrl);
        setShowResults(false);
        setOcrResults([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  // Load demo image for testing - COMMENTED OUT
  // const handleLoadDemoImage = async () => {
  //   try {
  //     // Load menu.jpg from public directory
  //     const response = await fetch('/menu.jpg');
  //     const blob = await response.blob();
  //     const file = new File([blob], 'menu.jpg', { type: 'image/jpeg' });
  //     
  //     // Set file to state
  //     setSelectedFile(file);
  //     
  //     // Create preview URL
  //     const previewUrl = URL.createObjectURL(file);
  //     setImagePreview(previewUrl);
  //     setUploadedImage(previewUrl);
  //     
  //     // Reset other states
  //     setShowResults(false);
  //     setOcrResults([]);
  //     setOriginalOcrResults([]);
  //     setError(null);
  //     setIsCompleting(false);
  //     
  //     console.log('Demo image loaded successfully, click Start Recognition to test');
  //   } catch (error) {
  //     console.error('Failed to load demo image:', error);
  //     setError('Failed to load demo image, please check if file exists in public directory');
  //   }
  // };

  const handleEditItem = (item: OCRResult) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (editedItem: OCRResult) => {
    setOcrResults(prev => 
      prev.map(item => 
        item.id === editedItem.id ? editedItem : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setOcrResults(prev => prev.filter(item => item.id !== id));
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
                Recognizing dishes in image...
              </div>
            </div>
          )}

          {showResults && ocrResults.length > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center justify-between">
                <div>
                  Recognition successful! Identified {ocrResults.length} dishes
                </div>
                {previewId && (
                  <div className="text-sm text-green-600">
                    Preview ID: {previewId} (valid for 15 minutes)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Menu Image</h3>
            
            {/* File input - always rendered but hidden */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {!uploadedImage && !imagePreview ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Upload a clear photo of your menu for automatic text recognition
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Choose Image
                  </button>
                  {/* Load Demo button - COMMENTED OUT */}
                  {/* <button
                    onClick={handleLoadDemoImage}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Image className="w-4 h-4 inline mr-2" />
                    Load Demo
                  </button> */}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supports JPG, PNG, PDF format menu images
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                  <div className="relative">
                    {(imagePreview || uploadedImage) && (
                      <img
                        src={imagePreview || uploadedImage || undefined}
                        alt="Uploaded menu"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                      />
                    )}
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePreview(null);
                      setSelectedFile(null);
                      setShowResults(false);
                      setOcrResults([]);
                      setOriginalOcrResults([]);
                      setPreviewId(null);
                      setError(null);
                      setIsCompleting(false);
                      // Clear file input
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      console.log('Start Recognition button clicked');
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
                </div>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {showResults && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recognition Results</h3>
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
                        <button
                          onClick={() => handleEditItem(item)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
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
                    {ocrResults.length} items ready to import
                  </div>
                  <button
                    onClick={async () => {
                      if (ocrResults.length > 0 && !isCompleting) {
                        setIsCompleting(true);
                        try {
                          console.log(`Starting to import ${ocrResults.length} menu items to database`);
                          console.log('Menu items to import:', ocrResults);
                          
                          // Check if there are modifications (including deletions)
                          // First check if the number of items changed (deletion/addition)
                          const itemCountChanged = ocrResults.length !== originalOcrResults.length;
                          
                          // Then check if any existing items were modified
                          const hasItemModifications = ocrResults.some(item => {
                            const originalItem = originalOcrResults.find(original => original.id === item.id);
                            if (!originalItem) return true; // If it's a new dish, consider it modified
            
                            return (
                              item.name !== originalItem.name ||
                              item.price !== originalItem.price ||
                              item.description !== originalItem.description ||
                              item.category !== originalItem.category
                            );
                          });
                          
                          const hasModifications = itemCountChanged || hasItemModifications;
                          
                          console.log(`Check modification status: ${hasModifications ? 'Modified' : 'Not modified'}`);
                          console.log(`Item count comparison: current=${ocrResults.length}, original=${originalOcrResults.length}, changed=${itemCountChanged}`);
                          console.log(`Item modifications detected: ${hasItemModifications}`);
                          
                          let successCount = 0;
                          let errorCount = 0;
                          
                          if (hasModifications) {
                            // Modified: pass merchant_id and all items data, no preview_id needed
                            console.log(`Modifications detected, using items method for import (pass complete item data, no preview_id)`);
                            
                            // Check if there are no categories (no existing menu data)
                            const hasNoCategories = categories.length === 0;
                            console.log(`No categories available: ${hasNoCategories}`);
                            
                            if (hasNoCategories) {
                              // No categories: use OCR batch import API with all items data, no preview_id
                              console.log('No existing menu data, using OCR batch import with all items data');
                              
                              // Convert OCR results to API format with all required fields
                              // merchant_id will be obtained from token automatically
                              const itemsForImport = ocrResults.map(item => ({
                                name: item.name || "", // Required field
                                price: item.price.toString(), // Required field, convert to string
                                description: item.description || "", // Optional field, pass empty string
                                category: item.category || "UNCATEGORIZED", // Required field, default to uncategorized
                                tags: item.tags || [], // Optional field, use OCR result or pass empty array
                                inventory: item.inventory || 10, // Required field, use OCR result or default inventory
                                image_url: item.image_url || "", // Required field, pass empty string for OCR import
                                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true, // Optional field, use OCR result or default to available
                                feature_one: item.feature_one || "", // Optional field, use OCR result or pass empty string
                                feature_two: item.feature_two || "", // Optional field, use OCR result or pass empty string
                                feature_three: item.feature_three || "" // Optional field, use OCR result or pass empty string
                              }));
                              
                              console.log('Calling OCR batch import API with items data (merchant_id from token):', {
                                items: itemsForImport
                              });
                              
                              // Validate data before sending
                              const validItems = itemsForImport.filter(item => {
                                if (!item.name || !item.name.trim()) {
                                  console.warn('Skipping item with empty name:', item);
                                  return false;
                                }
                                if (!item.price || isNaN(parseFloat(item.price))) {
                                  console.warn('Skipping item with invalid price:', item);
                                  return false;
                                }
                                return true;
                              });
                              
                              if (validItems.length === 0) {
                                throw new Error('No valid items to import');
                              }
                              
                              console.log('Validated items for import:', validItems);
                              
                              const result = await ocrAPI.importOCRItems({
                                items: validItems
                                // Note: no preview_id needed when passing items data
                              });
                              
                              console.log('OCR batch import API response:', result);
                              successCount = validItems.length;
                            } else {
                              // Has modifications: use batch import API with items array
                              console.log('Using batch import API with modified items');
                              
                              // Prepare items for import with modifications
                              const itemsForImport = ocrResults.map(item => ({
                                name: item.name || "", // Required field
                                price: item.price.toString(), // Required field, convert to string
                                description: item.description || "", // Optional field, pass empty string
                                category: item.category || "UNCATEGORIZED", // Required field, default to uncategorized
                                tags: item.tags || [], // Optional field, use OCR result or pass empty array
                                inventory: item.inventory || 10, // Required field, use OCR result or default inventory
                                image_url: item.image_url || "", // Required field, pass empty string for OCR import
                                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true, // Optional field, use OCR result or default to available
                                feature_one: item.feature_one || "", // Optional field, use OCR result or pass empty string
                                feature_two: item.feature_two || "", // Optional field, use OCR result or pass empty string
                                feature_three: item.feature_three || "" // Optional field, use OCR result or pass empty string
                              }));
                              
                              // Validate data before sending
                              const validItems = itemsForImport.filter(item => {
                                if (!item.name || !item.name.trim()) {
                                  console.warn('Skipping item with empty name:', item);
                                  return false;
                                }
                                if (!item.price || isNaN(parseFloat(item.price))) {
                                  console.warn('Skipping item with invalid price:', item);
                                  return false;
                                }
                                return true;
                              });
                              
                              if (validItems.length === 0) {
                                throw new Error('No valid items to import');
                              }
                              
                              // Use importOCRItems batch API instead of adding items individually
                              const result = await ocrAPI.importOCRItems({
                                items: validItems
                                // Note: merchant_id obtained from token automatically
                              });
                              
                              console.log('OCR batch import API response:', result);
                              successCount = validItems.length;
                            }
                          } else {
                            // No modifications: only pass preview_id, valid for 15 minutes (merchant_id from token)
                            console.log('No modifications, using preview_id method for batch import');
                            
                            if (!previewId) {
                              throw new Error('Missing preview_id, unable to perform batch import');
                            }
                            
                            // No modifications case: only pass preview_id, merchant_id from token
                            const result = await ocrAPI.importOCRItems({
                              preview_id: previewId
                              // Note: merchant_id obtained from token automatically
                            });
                            
                            console.log('Batch import API response:', result);
                            successCount = ocrResults.length; // Assume all successful
                          }
                          
                          console.log(`Import completed: ${successCount} successful, ${errorCount} failed`);
                          
                          // Re-fetch menu data from API to ensure correct IDs
                          console.log('Re-fetching menu data to ensure correct IDs...');
                          try {
                            // Fetch menu items (merchant_id from token)
                            const menuResponse = await menuAPI.getAllMenuItems();
                            console.log('Re-fetched menu data:', menuResponse.menuItems);
                            
                            // Update global state
                            dispatch({ 
                              type: 'SET_MENU_ITEMS', 
                              payload: menuResponse.menuItems.map((item: any) => ({
                                id: item.id.toString(),
                                name: item.name,
                                description: item.description,
                                price: parseFloat(item.price.toString()),
                                image_url: item.image_url,
                                category_id: item.category?.id?.toString() || '1',
                                category: {
                                  id: item.category?.id || 1,
                                  name: item.category?.name || 'Unknown'
                                },
                                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                                inventory: item.inventory || 0
                              }))
                            });
                          } catch (error) {
                            console.error('Failed to re-fetch menu data:', error);
                          }
                          
                          // Show import results
                          if (successCount > 0) {
                            alert(`Successfully imported ${successCount} items to menu!${errorCount > 0 ? ` (${errorCount} items failed)` : ''}`);
                          } else {
                            const errorMessage = `Failed to import any items. Please check the browser console for detailed error information.`;
                            alert(errorMessage);
                            console.error(`Import failed summary:`, {
                              totalItems: ocrResults.length,
                              successCount,
                              errorCount,
                              ocrResults,
                              categories: categories.map(cat => ({ id: cat.id, name: cat.name }))
                            });
                          }
                          
                          // Clear state
                          setShowResults(false);
                          setUploadedImage(null);
                          setImagePreview(null);
                          setSelectedFile(null);
                          setOcrResults([]);
                          setOriginalOcrResults([]);
                          setPreviewId(null);
                          setError(null);
                          // Clear file input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        } catch (error) {
                          console.error('Import process failed:', error);
                          setError(`Import process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                          setIsCompleting(false);
                        }
                      }
                    }}
                    disabled={ocrResults.length === 0 || isCompleting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? 'Processing...' : 'Complete Processing'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">How to Use OCR</h3>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>1. <strong>Take a clear photo</strong> of your menu in good lighting</p>
              <p>2. <strong>Upload the image</strong> using the button above</p>
              <p>3. <strong>Review results</strong> and edit if needed</p>
              <p>4. <strong>Delete unwanted items</strong> if necessary</p>
              <p>5. <strong>Complete import</strong> to add all items to your menu</p>
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
      [name]: name === 'price' ? parseFloat(value) || 0 : 
              name === 'inventory' ? parseInt(value) || 10 : 
              value
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
                  <option value="">Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="">No category data available</option>
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