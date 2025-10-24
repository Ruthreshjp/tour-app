import React, { useState } from 'react';

const defaultPlaceholder = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Loading...';

const getImageUrl = (url) => {
  // Return placeholder for null/undefined/empty values
  if (!url || url === 'null' || url === 'undefined' || url === '') {
    return defaultPlaceholder;
  }

  // Handle Firebase Storage URLs - return placeholder for now to avoid 404s
  if (url.startsWith('https://firebasestorage.googleapis.com')) {
    console.warn('Firebase URL detected, using placeholder:', url);
    return defaultPlaceholder;
    // return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // Handle MongoDB image URLs (ObjectId format)
  if (url.match(/^[0-9a-fA-F]{24}$/)) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/images/${url}`;
  }

  // Handle API image URLs
  if (url.startsWith('/api/images/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  }

  // Handle uploads folder URLs
  if (url.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  }

  // Handle full HTTP URLs (including placeholder URLs)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle public directory images (for static assets)
  if (url.startsWith('/images/')) {
    return url; // Serve directly from public directory
  }

  // Handle all other relative paths (serve from backend)
  if (url.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  }

  // If it's just a filename or relative path, try to serve from backend
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/api/images/${url}`;
};

export const Image = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = defaultPlaceholder,
  ...props 
}) => {
  const [error, setError] = useState(false);

  const handleError = (e) => {
    console.error('Image load error for URL:', src);
    console.error('Processed URL was:', getImageUrl(src));
    setError(true);
    e.target.src = placeholder;
  };

  const imageUrl = getImageUrl(src);
  
  // If no valid image URL, show placeholder immediately
  if (!src || src === 'null' || src === 'undefined' || src === '') {
    return (
      <img 
        src={placeholder}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img 
      src={error ? placeholder : imageUrl}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};