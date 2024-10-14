const express = require('express');
const { uploader,uploadFile, uploadinDB } = require('../controllers/fileController');
const router = express.Router();

// File upload route (protected)
router.post('/upload', uploader.single('file') , uploadFile , uploadinDB);

module.exports = router;
