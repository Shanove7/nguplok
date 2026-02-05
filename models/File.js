const mongoose = require('mongoose')

const FileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  size: Number,
  mimetype: String,
  createdAt: { type: Date, default: Date.now },
  expireAt: Date
})

FileSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('File', FileSchema)
