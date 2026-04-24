const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const courseMaterialController = require('../controllers/courseMaterialController');

const router = express.Router({ mergeParams: true });

// ── Multer setup ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'course_materials'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only PDF documents
  const allowedMimeTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  // Check either strict mime type or the file extension fallback
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" with extension "${ext}" is not allowed. Only PDF files are accepted.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10 MB
});

// ── Routes ─────────────────────────────────────────────────────
router.use(authenticate);

// All authenticated roles can view materials (access control is in service)
router.get('/', courseMaterialController.getByCourse);

// Only faculty can upload
router.post(
  '/',
  authorize('faculty'),
  upload.single('file'),
  courseMaterialController.upload
);

// Faculty (own material) or admin can delete
router.delete(
  '/:materialId',
  authorize('faculty', 'admin'),
  courseMaterialController.remove
);

module.exports = router;
