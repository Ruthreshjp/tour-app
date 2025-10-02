// client/src/pages/components/BusinessRating.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaStar, FaUser, FaCheckCircle } from 'react-icons/fa';

const BusinessRating = ({ businessId, businessType, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 0,
    service: 0,
    value: 0,
    location: 0,
    atmosphere: 0
  });
  const [loading, setLoading] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    checkRatingEligibility();
  }, [businessId]);

  const checkRatingEligibility = async () => {
    try {
      const response = await axios.get(`/api/business-rating/business/${businessId}/can-rate`, {
        withCredentials: true
      });

      if (response.data.success) {
        setCanRate(response.data.canRate);
        if (!response.data.canRate) {
          setHasRated(true);
        }
      }
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
    }
  };

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/business-rating/create', {
        businessId,
        businessType,
        rating,
        review,
        categories
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Rating submitted successfully!');
        setHasRated(true);
        onRatingSubmit && onRatingSubmit(response.data.rating);
      } else {
        toast.error(response.data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (hasRated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
        <p className="text-green-700 font-medium">You have already rated this business</p>
      </div>
    );
  }

  if (!canRate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-700">
          {businessType === 'hotel' || businessType === 'restaurant' || businessType === 'cab'
            ? 'You need to complete a booking before rating this business'
            : 'You need to visit this business before rating'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaStar className="mr-2 text-yellow-500" />
        Rate This Business
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                <FaStar />
              </button>
            ))}
          </div>
        </div>

        {/* Category Ratings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Rate by Category</h4>
          
          {Object.entries(categories).map(([category, value]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {category}
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleCategoryRating(category, star)}
                    className={`text-lg ${
                      star <= value ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write a Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Share your experience with this business..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default BusinessRating;
