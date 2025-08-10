const slugify = require('slugify')
const Blog = require('../models/Blog')

const generateUniqueSlug = async (title) => {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })

  let slug = baseSlug
  let counter = 1

  // Check if slug already exists
  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

module.exports = {
  generateUniqueSlug
}
