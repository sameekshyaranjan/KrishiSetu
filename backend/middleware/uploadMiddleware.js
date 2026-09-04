const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_CLOUD_NAME.includes('dummy')) {
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

module.exports = upload;
