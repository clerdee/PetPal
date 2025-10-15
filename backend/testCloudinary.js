require("dotenv").config();
const cloudinary = require("./config/cloudinary");

(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary Connected:", result);
  } catch (error) {
    console.error("❌ Cloudinary Error:", error.message);
  }
})();

// To run this test, use the command: node testCloudinary.js