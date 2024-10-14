require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.SECRET_TOKEN,
  CloudName: process.env.CLOUD_NAME,
  ApiKey: process.env.API_KEY,
  ApiSecret: process.env.API_SECRET
};
