const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { uploadToCloudinary } = require('../config/cloudinary')

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Middleware to upload to Cloudinary after multer processes the file
const uploadToCloudinaryMiddleware = async (req, res, next) => {
  if (req.file) {
    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path, 'blog-images')
      
      // Store Cloudinary URL and public_id
      req.cloudinaryResult = {
        url: result.secure_url,
        public_id: result.public_id
      }
      
      // Delete temporary file
      fs.unlinkSync(req.file.path)
      
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      // Delete temporary file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(500).json({
        success: false,
        message: 'Image upload failed'
      })
    }
  }
  next()
}

module.exports = {
  upload,
  uploadToCloudinaryMiddleware
}
