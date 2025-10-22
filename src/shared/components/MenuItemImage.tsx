import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface MenuItemImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showPlaceholder?: boolean;
}

const MenuItemImage: React.FC<MenuItemImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full",
  showPlaceholder = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // If no image URL or image load failed, show placeholder
  const shouldShowPlaceholder = !src || src.trim() === '' || imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (shouldShowPlaceholder && showPlaceholder) {
    return (
      <div className={`${fallbackClassName} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-1 bg-gray-300 rounded-lg flex items-center justify-center shadow-sm">
            <ImageOff className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 font-medium">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {src && src.trim() !== '' && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover object-center ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      {!imageLoaded && src && src.trim() !== '' && !imageError && (
        <div className={`${fallbackClassName} bg-gray-200 flex items-center justify-center absolute inset-0`}>
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MenuItemImage;
