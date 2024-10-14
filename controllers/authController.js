const { validationResult } = require('express-validator');
const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, msg: 'Errors', errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const existingUser  = await User.findOne({ email });
    if (existingUser ) {
      return res.status(409).json({ success: false, message: 'User already exists!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({ name, email, password: hashedPassword, role });
    const savedUser = await userData.save();

    return res.status(201).json({
      success: true,
      msg: 'New User Registered!',
      id: savedUser._id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, msg: 'Errors', errors: errors.array() });
    }

    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(404).json({ success: false, msg: 'User not found!' });
    }

    const MatchedPassword = await bcrypt.compare(password, userData.password);
    if (!MatchedPassword) {
      return res.status(401).json({
        success: false,
        msg: 'Email and Password is incorrect!',
      });
    }

    const generateAccessToken = async (userData) => {
      try {
        const token = await jwt.sign({ id: userData._id, role: userData.role }, config.jwtSecret, { expiresIn: "2h" });
        return token;
      } catch (error) {
        res.status(500).json({ message: 'Server error!' });
      }
    }

    const accessToken = await generateAccessToken(userData);

    return res.status(200).json({
      success: true,
      msg: 'Login Successfull!',
      accessToken: accessToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
};