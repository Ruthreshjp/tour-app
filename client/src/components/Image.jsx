import React, { useState } from 'react';

const defaultPlaceholder = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

export const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined' || url === '') {
    return defaultPlaceholder;
  }

  // Return full HTTP/HTTPS URLs directly (Unsplash, Firebase, etc.)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Handle MongoDB image ObjectIds
  if (url.match(/^[0-9a-fA-F]{24}$/)) {
    return `/api/images/${url}`;
  }

  // Handle relative API, upload, or image paths
  if (url.startsWith('/api/') || url.startsWith('/uploads/') || url.startsWith('/images/')) {
    return url;
  }

  if (url.startsWith('/')) {
    return url;
  }

  return `/api/images/${url}`;
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
    setError(true);
    e.target.src = placeholder;
  };

  const imageUrl = getImageUrl(src);

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