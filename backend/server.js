const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); 

dotenv.config({ path: 'config/.env' });
connectDatabase();

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('🔥 Firebase Admin SDK Initialized');
} catch (error) {
  console.error(`❌ Firebase Admin Error: ${error.message}`);
  process.exit(1); 
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = app.listen(process.env.PORT, () => { 
  console.log(`🚀 Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  console.log('Shutting down the server due to Unhandled Promise Rejection...');
  server.close(() => {
    process.exit(1);
  });
});