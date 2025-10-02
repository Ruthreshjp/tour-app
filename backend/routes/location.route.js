// backend/routes/location.route.js
import express from 'express';
import { geocodeAddress, findNearbyBusinesses, searchBusinessesByLocation } from '../controllers/location.controller.js';

const router = express.Router();

router.get('/geocode', geocodeAddress);
router.get('/nearby', findNearbyBusinesses);
router.get('/search', searchBusinessesByLocation);

export default router;