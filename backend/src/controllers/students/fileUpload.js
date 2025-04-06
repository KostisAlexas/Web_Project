const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ορισμός σταθερού path για όλα τα uploads
const UPLOAD_PATH = path.join(__dirname, '..', '..', 'uploads', 'studentFiles');

// Δημιουργία του φακέλου αν δεν υπάρχει
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${cleanFileName}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = {
  upload,
  UPLOAD_PATH
};