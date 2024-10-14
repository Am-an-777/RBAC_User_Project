const { register, login } = require('../controllers/authController');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('express-validator');
jest.mock('../models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if there are validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid email' }])
      });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Errors',
        errors: [{ msg: 'Invalid email' }]
      });
    });

    it('should return 409 if user already exists', async () => {
      req.body = { name: 'John', email: 'test@example.com', password: '123456', role: 'user' };
      User.findOne.mockResolvedValueOnce({ email: 'test@example.com' });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists!'
      });
    });

    it('should register new user and return 201', async () => {
      req.body = { name: 'John', email: 'test@example.com', password: '123456', role: 'user' };
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    
      const savedUser = { _id: '123', name: 'John', email: 'test@example.com', password: 'hashedPassword', role: 'user' };
      User.prototype.save = jest.fn().mockResolvedValueOnce(savedUser);
    
      await register(req, res);
    
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(User.prototype.save).toHaveBeenCalled();
    
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        msg: 'New User Registered!',
        id: expect.any(String),
        // data: expect.objectContaining({
        // }),
      });
    });
    

    it('should return 500 if an error occurs', async () => {
      req.body = { name: 'John', email: 'test@example.com', password: '123456', role: 'user' };
      const error = new Error('Database error');
      User.findOne.mockRejectedValueOnce(error);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Database error'
      });
    });
  });

  describe('login', () => {
    it('should return 400 if there are validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid email' }])
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Errors',
        errors: [{ msg: 'Invalid email' }]
      });
    });

    it('should return 404 if user is not found', async () => {
      req.body = { email: 'test@example.com', password: '123456' };
      User.findOne.mockResolvedValueOnce(null);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'User not found!'
      });
    });

    it('should return 401 if password does not match', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      User.findOne.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(false);

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Email and Password is incorrect!'
      });
    });

    it('should login user and return 200 with a token', async () => {
      req.body = { email: 'test@example.com', password: '123456' };
      const user = { _id: '123', email: 'test@example.com', password: 'hashedPassword', role: 'user' };
      User.findOne.mockResolvedValueOnce(user);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockResolvedValueOnce('fakeAccessToken');

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', role: 'user' },
        expect.any(String),
        { expiresIn: "2h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        msg: 'Login Successfull!',
        accessToken: 'fakeAccessToken',
        tokenType: 'Bearer'
      });
    });

    it('should return 500 if an error occurs during login', async () => {
      req.body = { email: 'test@example.com', password: '123456' };
      const error = new Error('Database error');
      User.findOne.mockRejectedValueOnce(error);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error!'
      });
    });
  });
});
