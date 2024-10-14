const { uploader, uploadFile, uploadinDB } = require('../controllers/fileController');
const cloudinary = require('cloudinary').v2;
const file = require('../models/FilePath');
const multer = require('multer');

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
    config: jest.fn(),
  },
}));

jest.mock('../models/FilePath');

jest.mock('multer', () => {
  const multerMock = {
    diskStorage: jest.fn(() => ({})),
    limits: { filesize: 1000000 },
  };

  const multerFunc = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => next()),
  }));

  multerFunc.diskStorage = multerMock.diskStorage;
  return multerFunc;
});

describe('File Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      file: { path: 'fake-file-path' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('uploadFile', () => {
    it('should upload a file to Cloudinary and call next', async () => {
      const cloudinaryResponse = { secure_url: 'https://cloudinary.com/fake-url' };
      cloudinary.uploader.upload.mockResolvedValue(cloudinaryResponse);

      await uploadFile(req, res, next);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('fake-file-path');
      expect(req.cloudinaryResult).toEqual(cloudinaryResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should return an error if Cloudinary upload fails', async () => {
      cloudinary.uploader.upload.mockRejectedValue(new Error('Cloudinary error'));

      await uploadFile(req, res, next);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('fake-file-path');
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error Uploading file' });
    });
  });

  describe('uploadinDB', () => {
    it('should save the file URL in the database and return success response', async () => {
      const mockCloudinaryResult = { secure_url: 'https://cloudinary.com/fake-url' };
      const mockDbRecord = { _id: 'someId', file_url: mockCloudinaryResult.secure_url };

      req.cloudinaryResult = mockCloudinaryResult;
      file.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockDbRecord),
      }));

      await uploadinDB(req, res);

      expect(file).toHaveBeenCalledWith({ file_url: mockCloudinaryResult.secure_url });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        msg: 'File Uploaded Successfully!',
        data: mockDbRecord,
      });
    });

    it('should return an error if saving to the database fails', async () => {
      const mockCloudinaryResult = { secure_url: 'https://cloudinary.com/fake-url' };

      req.cloudinaryResult = mockCloudinaryResult;
      file.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database save error')),
      }));

      await uploadinDB(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Database save error',
      });
    });
  });
});
