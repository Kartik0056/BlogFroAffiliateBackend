const Blog = require('../models/Blog')

// Get all blogs (public)
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')

    const total = await Blog.countDocuments({ published: true })
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get blogs error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get blog by slug (public)
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      published: true 
    })

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    // Increment views
    blog.views += 1
    await blog.save()

    res.json({
      success: true,
      blog
    })
  } catch (error) {
    console.error('Get blog by slug error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get blogs by category (public)
const getBlogsByCategory = async (req, res) => {
  try {
    const category = req.params.category.replace('-', ' ')
    const categoryFormatted = category.replace(/\b\w/g, l => l.toUpperCase())

    const blogs = await Blog.find({ 
      category: categoryFormatted, 
      published: true 
    })
      .sort({ createdAt: -1 })
      .select('-content')

    res.json({
      success: true,
      blogs,
      category: categoryFormatted
    })
  } catch (error) {
    console.error('Get blogs by category error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Search blogs (public)
const searchBlogs = async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        blogs: []
      })
    }

    const blogs = await Blog.find({
      published: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .sort({ createdAt: -1 })
      .select('-content')
      .limit(20)

    res.json({
      success: true,
      blogs,
      query: q
    })
  } catch (error) {
    console.error('Search blogs error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get featured blogs (public)
const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      featured: true, 
      published: true 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-content')

    res.json({
      success: true,
      blogs
    })
  } catch (error) {
    console.error('Get featured blogs error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getBlogsByCategory,
  searchBlogs,
  getFeaturedBlogs
}
