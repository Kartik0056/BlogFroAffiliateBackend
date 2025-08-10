const express = require('express')
const Blog = require('../models/Blog')
const { 
  getAllBlogs, 
  getBlogBySlug, 
  getBlogsByCategory, 
  searchBlogs, 
  getFeaturedBlogs 
} = require('../controllers/blogController')

const router = express.Router()

// Get all blogs (public)
router.get('/', getAllBlogs)

// Get blog by slug (public)
router.get('/slug/:slug', getBlogBySlug)

// Get blogs by category (public)
router.get('/category/:category', getBlogsByCategory)

// Search blogs (public)
router.get('/search', searchBlogs)

// Get featured blogs (public)
router.get('/featured', getFeaturedBlogs)

module.exports = router
