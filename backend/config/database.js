const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

const masterPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30'
});

const stagingPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_STAGING || 'student_database_staging',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30'
});

const testConnection = async () => {
  try {
    const connection = await masterPool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const connectHrmsDb = async () => {
  try {
    const mongoUri = process.env.HRMS_MONGO_URL;
    if (!mongoUri) {
        console.warn('⚠️ HRMS_MONGO_URL is not defined in .env');
        return false;
    }
    
    // Connect to HRMS MongoDB with read preference to secondary if available
    await mongoose.connect(mongoUri, {
        readPreference: 'secondaryPreferred' // We only need read-only access
    });
    console.log('✅ HRMS MongoDB connected successfully (Read Only)');
    return true;
  } catch (error) {
    console.error('❌ HRMS MongoDB connection failed:', error.message);
    return false;
  }
};

module.exports = { masterPool, stagingPool, testConnection, connectHrmsDb, mongoose };
