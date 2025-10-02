import express from 'express';
import Image from '../models/Image.js';
import { uploadSingle, uploadMultiple, uploadFields, processImage } from '../middleware/upload.js';

const router = express.Router();

// Test endpoint to check MongoDB connection
router.get('/test', async (req, res) => {
  try {
    console.log('Test endpoint called');
    const testDoc = await Image.findOne().limit(1);
    console.log('MongoDB query successful');
    res.json({
      success: true,
      message: 'MongoDB connection working',
      hasImages: !!testDoc
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    res.status(500).json({
      success: false,
      message: 'MongoDB connection failed: ' + error.message
    });
  }
});

// Test upload endpoint
router.post('/test-upload', uploadMultiple, async (req, res) => {
  try {
    console.log('Test upload endpoint called');
    console.log('Files received:', req.files?.length || 0);
    console.log('Body:', req.body);
    
    if (req.files && req.files.length > 0) {
      console.log('First file details:', {
        originalname: req.files[0].originalname,
        mimetype: req.files[0].mimetype,
        size: req.files[0].size,
        hasBuffer: !!req.files[0].buffer
      });
    }
    
    res.json({
      success: true,
      message: 'Test upload successful',
      filesReceived: req.files?.length || 0,
      body: req.body
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Test upload failed: ' + error.message
    });
  }
});

// Upload single image
router.post('/upload/single', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { category = 'additional', businessId, alt = '' } = req.body;

    const image = new Image({
      filename: `${Date.now()}-${originalname}`,
      originalName: originalname,
      mimetype,
      size,
      data: buffer,
      businessId: businessId || null,
      category,
      alt
    });

    await image.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: image._id,
        url: image.url,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        category: image.category
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message
    });
  }
});

// Upload multiple images
router.post('/upload/multiple', uploadMultiple, async (req, res) => {
  try {
    console.log('Multiple upload request received');
    console.log('Files:', req.files?.length || 0);
    console.log('Body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const { category = 'additional', businessId } = req.body;
    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Processing file ${i + 1}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bufferLength: file.buffer?.length
      });
      
      const { originalname, mimetype, size, buffer } = file;
      
      if (!buffer) {
        console.error('No buffer found for file:', originalname);
        throw new Error(`No buffer found for file: ${originalname}`);
      }
      
      const image = new Image({
        filename: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${originalname}`,
        originalName: originalname,
        mimetype,
        size,
        data: buffer,
        businessId: businessId || null,
        category,
        alt: ''
      });

      console.log('Attempting to save image to MongoDB...');
      await image.save();
      console.log('Image saved successfully:', image._id);
      
      uploadedImages.push({
        id: image._id,
        url: image.url,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        category: image.category
      });
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload business images (main + additional)
router.post('/upload/business', uploadFields, processImage, async (req, res) => {
  try {
    const { businessId } = req.body;
    const uploadedImages = {
      mainImage: null,
      additionalImages: []
    };

    // Handle main image
    if (req.files.mainImage && req.files.mainImage[0]) {
      const file = req.files.mainImage[0];
      const image = new Image({
        filename: `main-${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
        businessId: businessId || null,
        category: 'main',
        alt: 'Main business image'
      });

      await image.save();
      uploadedImages.mainImage = {
        id: image._id,
        url: image.url,
        filename: image.filename,
        originalName: image.originalName,
        size: image.size,
        category: image.category
      };
    }

    // Handle additional images
    if (req.files.additionalImages) {
      for (const file of req.files.additionalImages) {
        const image = new Image({
          filename: `additional-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          data: file.buffer,
          businessId: businessId || null,
          category: 'additional',
          alt: 'Additional business image'
        });

        await image.save();
        uploadedImages.additionalImages.push({
          id: image._id,
          url: image.url,
          filename: image.filename,
          originalName: image.originalName,
          size: image.size,
          category: image.category
        });
      }
    }

    res.json({
      success: true,
      message: 'Business images uploaded successfully',
      ...uploadedImages
    });
  } catch (error) {
    console.error('Business upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload business images: ' + error.message
    });
  }
});

// Get image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': image.mimetype,
      'Content-Length': image.size,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': image._id.toString()
    });

    res.send(image.data);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image: ' + error.message
    });
  }
});

// Get images by business ID
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category } = req.query;

    const query = { businessId };
    if (category) {
      query.category = category;
    }

    const images = await Image.find(query)
      .select('-data') // Exclude binary data
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        url: img.url,
        filename: img.filename,
        originalName: img.originalName,
        size: img.size,
        category: img.category,
        alt: img.alt,
        createdAt: img.createdAt
      }))
    });
  } catch (error) {
    console.error('Get business images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve business images: ' + error.message
    });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image: ' + error.message
    });
  }
});

// Get image info (metadata only)
router.get('/:id/info', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).select('-data');
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      image: {
        id: image._id,
        url: image.url,
        filename: image.filename,
        originalName: image.originalName,
        mimetype: image.mimetype,
        size: image.size,
        category: image.category,
        alt: image.alt,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      }
    });
  } catch (error) {
    console.error('Get image info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image info: ' + error.message
    });
  }
});

export default router;
