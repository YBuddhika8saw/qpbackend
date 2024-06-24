import multer from 'multer';
import path from 'path';
import uniqid from 'uniqid';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'frontend/src/assets/images/uploads');
  },
  filename: (req, file, cb) => {
    // const uniqueId = uniqid();
    const fileName= file.originalname;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${fileName}`);
  },
});

// Initialize multer
const upload = multer({ storage });
const storageResource = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'frontend/src/assets/files/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueId = uniqid();
    const fileName= file.originalname;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${fileName}`);
  },
});

// Initialize multer
const uploadResource = multer({ storage: storageResource });

export { upload, uploadResource };
