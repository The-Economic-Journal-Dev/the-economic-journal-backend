import multer from "multer";

// Configure multer storage options
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;