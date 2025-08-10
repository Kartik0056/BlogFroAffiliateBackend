const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { login, verifyToken, createAdmin } = require('../controllers/authController')

const router = express.Router()

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], login)

// Verify token
router.get('/verify', auth, verifyToken)

// Create admin user (run once)
router.post('/create-admin', createAdmin)

module.exports = router
