// backend/routes/geocode.route.js
import express from 'express';
import { geocodeAddress, reverseGeocode } from '../controllers/geocode.controller.js';

const router = express.Router();

// Geocoding routes (no authentication required for basic geocoding)
router.get('/', geocodeAddress);
router.get('/reverse', reverseGeocode);

export default router;
