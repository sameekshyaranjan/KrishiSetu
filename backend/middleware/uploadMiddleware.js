const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { isS3Configured, uploadToS3 } = require('../config/s3');
const dotenv = require('dotenv');

dotenv.config();

let storage;

if (isS3Configured) {
  // Enterprise AWS S3 Storage
  storage = multer.memoryStorage();
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_CLOUD_NAME.includes('dummy')) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let folder = 'krishisetu_crops';
      if (file.fieldname === 'vehiclePhoto') {
        folder = 'krishisetu_trucks';
      } else if (file.fieldname === 'proofPhotos') {
        folder = 'krishisetu_disputes';
      } else if (file.fieldname === 'profileImage' || file.fieldname === 'avatar') {
        folder = 'krishisetu_profiles';
      }
      return {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
      };
    },
  });
} else {
  // Safe disk storage fallback
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const cleanName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, cleanName);
    }
  });
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

upload.cloudinary = cloudinary;

/**
 * Automatically streams buffer to Amazon S3 if S3 storage is enabled
 */
const handleS3Upload = async (req, res, next) => {
  if (!isS3Configured) return next();
  try {
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const s3Url = await uploadToS3(req.file.buffer, key, req.file.mimetype);
      req.file.path = s3Url;
      req.file.location = s3Url;
      req.file.s3Key = key;
    }
    if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of filesArray) {
        const ext = path.extname(file.originalname) || '.jpg';
        const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const s3Url = await uploadToS3(file.buffer, key, file.mimetype);
        file.path = s3Url;
        file.location = s3Url;
        file.s3Key = key;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

upload.handleS3Upload = handleS3Upload;

module.exports = upload;

