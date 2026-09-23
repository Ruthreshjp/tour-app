export const getImageUrl = (img, fallback = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80") => {
  if (!img) return fallback;
  if (typeof img !== "string") return fallback;
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img;
  }
  if (img.startsWith("/uploads") || img.startsWith("uploads/")) {
    const clean = img.startsWith("/") ? img : `/${img}`;
    return `http://localhost:8000${clean}`;
  }
  return `http://localhost:8000/images/${img}`;
};
