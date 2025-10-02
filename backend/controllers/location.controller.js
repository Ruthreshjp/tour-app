// backend/controllers/location.controller.js
import axios from 'axios';
import dotenv from 'dotenv';
import Business from '../models/business.model.js';

dotenv.config();

const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${process.env.OPENCAGE_API_KEY}&language=en`
    );

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      res.status(200).json({
        success: true,
        latitude: lat,
        longitude: lng
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error geocoding address'
    });
  }
};

// Get businesses near a location
const findNearbyBusinesses = async (req, res) => {
  try {
    const { lat, lng, type, radius = 5000, status = 'approved' } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      isVerified: true,
      isActive: true
    };

    // Add business type filter if specified
    if (type && type !== 'all') {
      query.businessType = type.toLowerCase();
    }

    // Add status filter (approved businesses only by default)
    if (status) {
      query.status = status;
    }

    // Only get businesses that have completed setup
    query.setupCompleted = true;

    const businesses = await Business.find(query)
      .select('-password -loginCode -__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      businesses
    });
  } catch (error) {
    console.error('Find nearby businesses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error finding nearby businesses'
    });
  }
};

// Search businesses by location name (city, area, etc.)
const searchBusinessesByLocation = async (req, res) => {
  try {
    const { location, type, status = 'approved' } = req.query;

    const query = {
      isVerified: true,
      isActive: true,
      setupCompleted: true
    };

    // Add location filter only if location is provided
    if (location && location.trim()) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
        { area: { $regex: location, $options: 'i' } }
      ];
    }

    // Add business type filter if specified
    if (type && type !== 'all') {
      query.businessType = type.toLowerCase();
    }

    // Add status filter (approved businesses only by default)
    if (status) {
      query.status = status;
    }

    const businesses = await Business.find(query)
      .select('-password -loginCode -__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      businesses,
      searchLocation: location
    });
  } catch (error) {
    console.error('Search businesses by location error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching businesses by location'
    });
  }
};

export {
  geocodeAddress,
  findNearbyBusinesses,
  searchBusinessesByLocation
};