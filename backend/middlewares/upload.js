import multer from 'multer';
import sharp from 'sharp';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Image processing middleware
export const processImage = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const processFile = async (file) => {
      // Compress and optimize image
      const processedBuffer = await sharp(file.buffer)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .toBuffer();

      return {
        ...file,
        buffer: processedBuffer,
        size: processedBuffer.length,
        mimetype: 'image/jpeg' // Standardize to JPEG
      };
    };

    if (req.file) {
      req.file = await processFile(req.file);
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files = await Promise.all(req.files.map(processFile));
      } else {
        // Handle multiple field names
        for (const fieldName in req.files) {
          req.files[fieldName] = await Promise.all(
            req.files[fieldName].map(processFile)
          );
        }
      }
    }

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Error processing image: ' + error.message 
    });
  }
};

// Export different upload configurations
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);
export const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
  { name: 'menuCards', maxCount: 5 },
  { name: 'menuItems', maxCount: 20 }
]);

export default upload;
