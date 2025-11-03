START:
backend - npm start
frontend - npm run dev

connect soon with axios

🐾 PetPal — Pet Products & Grooming Services
🐕 Buy pet food or book pet grooming services.

BACKEND (Node + Express + MongoDB + Cloudinary):
1. Authentication (bcrypt + JWT)
2. Photo uploads (multer + cloudinary)
3. Email sending (nodemailer)
4. Validation (validator)
5. Database (mongoose)

FRONTEND (React + MUI + Bootstrap + React Router + Toastify):
1. UI Design with CSS, Bootstrap, and MUI
2. Form validation (you can add yup + react-hook-form easily)
3. Filtering (price/category/rating)
4. Pagination / infinite scroll
5. Toast notifications

Key Features:
Two modules: Products and Services
CRUD for both (multi-photo)
Customers can rate services or products
Admin updates booking status and sends email updates

- PACKAGES
cd backend - npm start
npm init -y
npm i express mongoose cors dotenv bcryptjs jsonwebtoken multer cloudinary nodemailer validator crypto bad-words firebase-admin -D nodemon (npm list)

cd frontend - npm run dev
npm create vite@latest .
npm i react-router-dom axios react-toastify @mui/material @emotion/react @emotion/styled react-bootstrap react-helmet react-js-pagination formik yup recharts (npm list)

cd petpal
npm init -y
npm install concurrently - axios
- 

db
model
controller
route
middleware(?)
insomnia(testing)

Once this works, we can continue with:

🐾 Protecting routes (authMiddleware)
📧 Enabling email notifications (using Nodemailer + SMTP)
🛒 Adding CRUD for Products and Services
🧾 Adding Ratings and Bookings

=====
FRONTEND
App.jsx - route configuration for the frontend

log in function work then push changes 
create account = register
about & contact sa baba ng home/together with home (check html)
