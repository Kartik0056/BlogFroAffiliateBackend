const mongoose = require('mongoose')
const slugify = require('slugify')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Mobiles', 'Electronics', 'Fashion', 'Home Appliances', 'Gaming', 'Accessories']
  },
  price: {
    type: Number,
    min: 0
  },
  affiliateLink: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Create slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    })
  }
  next()
})

// Indexes for better performance
blogSchema.index({ slug: 1 })
blogSchema.index({ category: 1 })
blogSchema.index({ published: 1 })
blogSchema.index({ createdAt: -1 })
blogSchema.index({ title: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Blog', blogSchema)
