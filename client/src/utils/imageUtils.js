export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Handle Firebase storage URLs
  if (imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
    return `/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // Handle local file paths
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // Handle relative paths for static assets
  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }
  
  // Return as-is for other URLs
  return imageUrl;
};