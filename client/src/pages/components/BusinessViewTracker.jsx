// client/src/pages/components/BusinessViewTracker.jsx
import React, { useEffect, useRef } from 'react';
import axios from 'axios';

const BusinessViewTracker = ({ businessId, businessType, source = 'direct' }) => {
  const startTimeRef = useRef(Date.now());
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const trackView = async () => {
      if (hasTrackedRef.current) return;
      
      try {
        // Track initial view
        await axios.post('/api/business-view/track', {
          businessId,
          businessType,
          duration: 0,
          source
        }, {
          withCredentials: true
        });
        
        hasTrackedRef.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();

    // Track view duration when component unmounts
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      if (duration > 5) { // Only track if user spent more than 5 seconds
        axios.post('/api/business-view/track', {
          businessId,
          businessType,
          duration,
          source
        }, {
          withCredentials: true
        }).catch(error => {
          console.error('Error tracking view duration:', error);
        });
      }
    };
  }, [businessId, businessType, source]);

  return null; // This component doesn't render anything
};

export default BusinessViewTracker;
