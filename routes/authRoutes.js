const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const {registerationValidation,loginValidation} = require('../validators/validators.js')

// Register route 
router.post('/register', registerationValidation, register);

// Login route 
router.post('/login', loginValidation, login);

module.exports = router;
