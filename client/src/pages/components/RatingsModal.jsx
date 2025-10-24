import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const RatingsModal = ({ isOpen, onClose, booking, business, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        rating,
        review: review.trim()
      };

      if (booking?._id) {
        payload.bookingId = booking._id;
      } else {
        const businessId = business?._id || business?.id || business?.businessId;
        if (!businessId) {
          toast.error('Invalid business information for rating');
          setLoading(false);
          return;
        }
        payload.businessId = businessId;
      }

      const response = await axios.post('/api/analytics/rating', payload);

      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        onRatingSubmitted && onRatingSubmitted(response.data);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rate Your Experience</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Business Info */}
          {(booking || business) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                {booking?.businessId?.businessName || booking?.businessName || business?.businessName || business?.name}
              </h4>
              {booking ? (
                <>
                  <p className="text-sm text-gray-600">
                    {booking.businessType === 'hotel' && 'Hotel Stay'}
                    {booking.businessType === 'restaurant' && 'Restaurant Visit'}
                    {booking.businessType === 'cafe' && 'Cafe Visit'}
                    {booking.businessType === 'cab' && 'Cab Service'}
                    {booking.businessType === 'shopping' && 'Shopping Experience'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Share your experience with this business
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Rating Stars */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="text-3xl transition-colors focus:outline-none"
                  >
                    <FaStar
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 0 ? 'Select a rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your feedback (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {review.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your feedback helps us improve our services
          </p>
        </div>
      </div>
    </div>
  );
};

export default RatingsModal;
