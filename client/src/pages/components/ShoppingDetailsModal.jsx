import React, { useMemo } from 'react';
import { FaTimes, FaPhone, FaMapMarkerAlt, FaGlobe, FaTag, FaShoppingBag } from 'react-icons/fa';
import { Image } from '../../components/Image';

const ShoppingDetailsModal = ({ business, isOpen, onClose }) => {

  const primaryImage = useMemo(() => {
    if (!business) return null;
    return (
      business.profileImage ||
      business.mainImage ||
      (business.businessImages && business.businessImages.length > 0 && business.businessImages[0]) ||
      (business.images && business.images.length > 0 && business.images[0]) ||
      (business.additionalImages && business.additionalImages.length > 0 && business.additionalImages[0]) ||
      null
    );
  }, [business]);

  const additionalImages = useMemo(() => {
    if (!business) return [];
    const gallery = business.businessImages || business.additionalImages || business.images || [];
    return gallery.filter((img) => img && img !== primaryImage);
  }, [business, primaryImage]);

  const products = business?.products || [];
  const categories = business?.categories || [];

  if (!isOpen || !business) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-xl flex flex-col">
        <div className="relative flex-shrink-0">
          <Image
            src={primaryImage}
            alt={business.businessName || business.name}
            className="w-full h-64 object-cover"
            placeholder="https://placehold.co/800x300/e2e8f0/64748b?text=Store+Image"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-colors"
          >
            <FaTimes size={18} />
          </button>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow">
            <div className="flex items-center gap-2">
              <FaShoppingBag className="text-orange-500" />
              <span className="font-semibold text-gray-800 capitalize">
                {business.businessType || 'Shopping'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{business.businessName || business.name}</h2>
              {business.description && (
                <p className="mt-2 text-gray-600 leading-relaxed max-w-3xl">{business.description}</p>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-1 text-orange-500" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-gray-600">
                      {[business.address, business.city, business.state, business.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaPhone className="mt-1 text-green-500" />
                  <div>
                    <p className="font-medium">Contact</p>
                    {business.phone ? (
                      <a href={`tel:${business.phone}`} className="text-sm text-blue-600 hover:underline">
                        {business.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>
                {business.website && (
                  <div className="flex items-start gap-2">
                    <FaGlobe className="mt-1 text-indigo-500" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-500">Customer Rating</p>
              <p className="mt-2 text-sm text-gray-600">
                Ratings can be submitted after completing a booking.
              </p>
            </div>
          </div>

          {additionalImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {additionalImages.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`Store gallery ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    placeholder="https://placehold.co/300x200/e2e8f0/64748b?text=Store+Image"
                  />
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category._id || category.name}
                    className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-sm"
                  >
                    <FaTag />
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Featured Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product._id || product.name}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <span className="text-green-600 font-semibold">
                        ₹{(product.discountPrice > 0 ? product.discountPrice : product.price) || 0}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{product.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      {typeof product.stock !== 'undefined' && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          Stock: {product.stock}
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingDetailsModal;
