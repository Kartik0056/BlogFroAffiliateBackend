const express = require('express')
const { body, validationResult } = require('express-validator')
const Blog = require('../models/Blog')
const auth = require('../middleware/auth')
const { upload, uploadToCloudinaryMiddleware } = require('../middleware/upload')
const {
  getDashboardStats,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleFeatured,
  togglePublished
} = require('../controllers/adminController')

const router = express.Router()

// All admin routes require authentication
router.use(auth)

// Get dashboard stats
router.get('/stats', getDashboardStats)

// Get all blogs for admin
router.get('/blogs', getAdminBlogs)

// Get single blog for editing
router.get('/blogs/:id', getBlogById)

// Create new blog
router.post('/blogs', 
  upload.single('image'), 
  uploadToCloudinaryMiddleware,
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').trim().isLength({ min: 1, max: 500 }),
    body('content').trim().isLength({ min: 1 }),
    body('category').isIn(['Mobiles', 'Electronics', 'Fashion', 'Home Appliances', 'Gaming', 'Accessories'])
  ], 
  createBlog
)

// Update blog
router.put('/blogs/:id', 
  upload.single('image'), 
  uploadToCloudinaryMiddleware,
  [
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').trim().isLength({ min: 1, max: 500 }),
    body('content').trim().isLength({ min: 1 }),
    body('category').isIn(['Mobiles', 'Electronics', 'Fashion', 'Home Appliances', 'Gaming', 'Accessories'])
  ], 
  updateBlog
)

// Delete blog
router.delete('/blogs/:id', deleteBlog)

// Toggle featured status
router.patch('/blogs/:id/featured', toggleFeatured)

// Toggle published status
router.patch('/blogs/:id/published', togglePublished)

module.exports = router
