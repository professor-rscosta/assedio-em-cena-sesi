const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nome);
  },
});

const tiposPermitidos = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (tiposPermitidos.includes(ext)) return cb(null, true);
    cb(new Error('Tipo de arquivo não permitido. Envie uma imagem.'));
  },
});

module.exports = { upload, UPLOAD_DIR };
