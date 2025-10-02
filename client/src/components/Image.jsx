import React, { useState } from 'react';

const defaultPlaceholder = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Loading...';

const getImageUrl = (url) => {
  // Return placeholder for null/undefined/empty values
  if (!url || url === 'null' || url === 'undefined') {
    return defaultPlaceholder;
  }

  // Handle Firebase Storage URLs
  if (url.startsWith('https://firebasestorage.googleapis.com')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
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

  // Handle full HTTP URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle all relative paths (serve from backend)
  if (url.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  }

  return url;
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
    console.error('Image load error:', src);
    setError(true);
    e.target.src = placeholder;
  };

  return (
    <img 
      src={error ? placeholder : getImageUrl(src)}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};