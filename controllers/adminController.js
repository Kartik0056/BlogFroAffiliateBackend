const { validationResult } = require('express-validator')
const Blog = require('../models/Blog')
const { deleteFromCloudinary } = require('../config/cloudinary')

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments()
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ])
    const totalCategories = await Blog.distinct('category').then(cats => cats.length)

    res.json({
      success: true,
      stats: {
        totalBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalCategories
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get all blogs for admin
const getAdminBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')

    const total = await Blog.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      blogs,
      totalPages,
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get admin blogs error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get single blog for editing
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    res.json({
      success: true,
      blog
    })
  } catch (error) {
    console.error('Get blog error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Create new blog
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
    }

    const { title, description, content, category, price, affiliateLink, tags } = req.body
    
    const blogData = {
      title,
      description,
      content,
      category,
      price: price ? parseFloat(price) : undefined,
      affiliateLink: affiliateLink || undefined,
      tags: tags ? JSON.parse(tags) : []
    }

    // Use Cloudinary URL if image was uploaded
    if (req.cloudinaryResult) {
      blogData.image = req.cloudinaryResult.url
      blogData.imagePublicId = req.cloudinaryResult.public_id
    }

    const blog = new Blog(blogData)
    await blog.save()

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog
    })
  } catch (error) {
    console.error('Create blog error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Update blog
const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
    }

    const { title, description, content, category, price, affiliateLink, tags } = req.body
    
    const updateData = {
      title,
      description,
      content,
      category,
      price: price ? parseFloat(price) : undefined,
      affiliateLink: affiliateLink || undefined,
      tags: tags ? JSON.parse(tags) : []
    }

    // Get existing blog to check for old image
    const existingBlog = await Blog.findById(req.params.id)
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    // If new image uploaded, delete old one from Cloudinary
    if (req.cloudinaryResult) {
      if (existingBlog.imagePublicId) {
        try {
          await deleteFromCloudinary(existingBlog.imagePublicId)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
      updateData.image = req.cloudinaryResult.url
      updateData.imagePublicId = req.cloudinaryResult.public_id
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog
    })
  } catch (error) {
    console.error('Update blog error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    // Delete image from Cloudinary if exists
    if (blog.imagePublicId) {
      try {
        await deleteFromCloudinary(blog.imagePublicId)
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error)
      }
    }

    await Blog.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    })
  } catch (error) {
    console.error('Delete blog error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Toggle blog featured status
const toggleFeatured = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    blog.featured = !blog.featured
    await blog.save()

    res.json({
      success: true,
      message: `Blog ${blog.featured ? 'featured' : 'unfeatured'} successfully`,
      blog
    })
  } catch (error) {
    console.error('Toggle featured error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Toggle blog published status
const togglePublished = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      })
    }

    blog.published = !blog.published
    await blog.save()

    res.json({
      success: true,
      message: `Blog ${blog.published ? 'published' : 'unpublished'} successfully`,
      blog
    })
  } catch (error) {
    console.error('Toggle published error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

module.exports = {
  getDashboardStats,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleFeatured,
  togglePublished
}
