const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { nanoid } = require('nanoid')

const File = require('./models/File')

const app = express()
const PORT = process.env.PORT || 3000

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err))

// Upload dir
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const id = nanoid(8)
    cb(null, id + path.extname(file.originalname))
  }
})

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 }, storage })

app.use('/file', express.static(uploadDir))
app.use(express.static('public'))

// Upload API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const url = `${req.protocol}://${req.get('host')}/file/${req.file.filename}`

  const data = await File.create({
    filename: req.file.filename,
    url,
    size: req.file.size,
    mimetype: req.file.mimetype,
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })

  res.json({ success: true, url, id: data._id })
})

// API info
app.get('/api/info/:id', async (req, res) => {
  const file = await File.findById(req.params.id)
  if (!file) return res.status(404).json({ error: 'Not found' })
  res.json(file)
})

app.listen(PORT, () => console.log('Running on port ' + PORT))
