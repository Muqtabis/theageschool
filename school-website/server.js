require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'gallery-data.json');

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// --- Simulated Authentication ---
const IS_ADMIN = true; 
const checkAdmin = (req, res, next) => {
  if (IS_ADMIN) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
};


// --- Helper Functions for Data Handling ---
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ albums: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- Multer Configuration for Multiple Files ---
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  }
});

// --- API Routes ---

app.get('/api/session', (req, res) => {
    res.json({ isAdmin: IS_ADMIN });
});

app.get('/api/albums', (req, res) => {
  const data = readData();
  const albumsForGrid = data.albums.map(album => ({
    id: album.id,
    name: album.name,
    eventDate: album.eventDate,
    description: album.description,
    coverImage: album.photos.length > 0 ? album.photos[0].src : '/default-cover.png'
  }));
  res.json(albumsForGrid);
});

app.get('/api/albums/:id', (req, res) => {
  const data = readData();
  const album = data.albums.find(a => a.id === parseInt(req.params.id));
  if (album) {
    res.json(album);
  } else {
    res.status(404).json({ error: 'Album not found' });
  }
});

app.post('/api/albums', checkAdmin, (req, res) => {
  const data = readData();
  const { name, eventDate, description } = req.body;
  
  const newAlbum = {
    id: Date.now(),
    name: sanitizeHtml(name),
    eventDate: sanitizeHtml(eventDate),
    description: sanitizeHtml(description),
    photos: []
  };

  data.albums.unshift(newAlbum);
  writeData(data);
  res.status(201).json(newAlbum);
});

app.post('/api/albums/:id/photos', checkAdmin, upload.array('photos', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const data = readData();
  const albumIndex = data.albums.findIndex(a => a.id === parseInt(req.params.id));

  if (albumIndex === -1) {
    req.files.forEach(file => fs.unlinkSync(file.path));
    return res.status(404).json({ error: 'Album not found.' });
  }
  const newAlbum = {
  id: uuidv4(), // instead of Date.now()
  name: sanitizeHtml(name),
  eventDate: sanitizeHtml(eventDate),
  description: sanitizeHtml(description),
  photos: []
};

  const newPhotos = req.files.map(file => ({
  id: uuidv4(), // instead of Date.now() + Math.random()
  src: `/uploads/${file.filename}`,
  caption: sanitizeHtml(req.body.caption || file.originalname)
}));


  data.albums[albumIndex].photos.unshift(...newPhotos);
  writeData(data);

  res.status(201).json({ message: `${req.files.length} photos added successfully.` });
});


app.delete('/api/photos/:photoId', checkAdmin, (req, res) => {
    const data = readData();
    const photoId = parseFloat(req.params.photoId);
    let photoFound = false;

    data.albums.forEach(album => {
        const photoIndex = album.photos.findIndex(p => p.id === photoId);
        if (photoIndex > -1) {
            const [deletedPhoto] = album.photos.splice(photoIndex, 1);
            const filePath = path.join(__dirname, deletedPhoto.src);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            photoFound = true;
        }
    });

    if (photoFound) {
        writeData(data);
        res.status(200).json({ message: 'Photo deleted.' });
    } else {
        res.status(404).json({ error: 'Photo not found.' });
    }
});
// server.js (add this new route)

/**
 * @route   GET /api/featured-photos
 * @desc    Get the 5 most recently uploaded photos for the homepage slideshow
 */
app.get('/api/featured-photos', (req, res) => {
  try {
    const data = readData();
    // Get all photos from all albums into a single list
    const allPhotos = data.albums.flatMap(album => album.photos);
    // Sort by ID (timestamp) descending to get the newest first
    allPhotos.sort((a, b) => b.id - a.id);
    // Return the top 5
    const featuredPhotos = allPhotos.slice(0, 5);
    res.json(featuredPhotos);
  } catch (error) {
    console.error("Error fetching featured photos:", error);
    res.status(500).json({ error: 'Failed to get featured photos.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/gallery.html`);
});