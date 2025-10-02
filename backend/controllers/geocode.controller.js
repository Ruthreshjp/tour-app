// backend/controllers/geocode.controller.js
import axios from 'axios';

// Simple geocoding using OpenStreetMap Nominatim (free, no API key required)
export const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    // Use OpenStreetMap Nominatim for geocoding (free, no API key)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'TravelApp/1.0' // Required by Nominatim
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      res.status(200).json({
        success: true,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Address not found'
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

// Reverse geocoding (coordinates to address)
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'TravelApp/1.0'
      }
    });

    if (response.data) {
      res.status(200).json({
        success: true,
        address: response.data.display_name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Address not found for coordinates'
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reverse geocoding coordinates'
    });
  }
};
