const fs = require('fs')
const path = require('path')
const config = require('../../../config/config')

const unlinkfile = async fileUrl => {
  if (fileUrl && fileUrl !== '') {
    if (await fs.existsSync(fileUrl)) {
      await fs.unlinkSync(fileUrl)
      return { status: true, message: 'All Ok' }
    }
    return { status: false, message: 'File not found.' }
  }
  return { status: false, message: 'File path is required to delete.' }
}

module.exports = { unlinkfile }
