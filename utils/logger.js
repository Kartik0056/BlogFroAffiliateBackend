const fs = require('fs')
const path = require('path')

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Simple logger utility
const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] INFO: ${message}`
    
    console.log(logMessage, data || '')
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'info.log'),
        `${logMessage} ${data ? JSON.stringify(data) : ''}\n`
      )
    }
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ERROR: ${message}`
    
    console.error(logMessage, error || '')
    
    // Write to file
    fs.appendFileSync(
      path.join(logsDir, 'error.log'),
      `${logMessage} ${error ? error.stack || error : ''}\n`
    )
  },

  warn: (message, data = null) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] WARN: ${message}`
    
    console.warn(logMessage, data || '')
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'warn.log'),
        `${logMessage} ${data ? JSON.stringify(data) : ''}\n`
      )
    }
  }
}

module.exports = logger
