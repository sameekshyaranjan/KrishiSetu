const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'krishisetu-media-bucket';

let s3Client = null;
const isConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY &&
  !process.env.AWS_ACCESS_KEY_ID.includes('dummy')
);

if (isConfigured) {
  try {
    s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log(`[AWS S3] Initialized client for region: ${s3Region}, bucket: ${bucketName}`);
  } catch (err) {
    console.warn('[AWS S3] Initialization failed, falling back to local/Cloudinary storage:', err.message);
  }
} else {
  console.log('[AWS S3] No AWS credentials detected. Operating in local/Cloudinary fallback mode.');
}

/**
 * Upload buffer to Amazon S3
 */
const uploadToS3 = async (fileBuffer, key, mimeType = 'image/jpeg') => {
  if (!s3Client || !isConfigured) {
    throw new Error('AWS S3 client is not configured with valid credentials.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: {
      platform: 'KrishiSetu-Karnataka-Agri-Exchange',
      uploadedAt: new Date().toISOString()
    }
  });

  await s3Client.send(command);

  // Return public or CloudFront URL
  if (process.env.AWS_CLOUDFRONT_DOMAIN) {
    return `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;
  }
  return `https://${bucketName}.s3.${s3Region}.amazonaws.com/${key}`;
};

/**
 * Delete object from S3
 */
const deleteFromS3 = async (key) => {
  if (!s3Client || !isConfigured) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return await s3Client.send(command);
};

/**
 * Generate temporary pre-signed download URL for protected audit files
 */
const getSignedS3Url = async (key, expiresInSeconds = 3600) => {
  if (!s3Client || !isConfigured) return null;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

module.exports = {
  s3Client,
  isS3Configured: isConfigured,
  uploadToS3,
  deleteFromS3,
  getSignedS3Url,
  bucketName,
  s3Region
};
