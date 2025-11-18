  // app.jsx
  import React from "react";
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

  // header and footer
  import MainLayout from './layout/mainlayout.jsx';

  // Pages
  import Home from './pages/Home/home.jsx';
  import Products from './pages/products.jsx';
  import ProductDetails from './pages/productdetails.jsx';
  import Profile from './user/profile.jsx'; 

  // bouncer
  import ProtectedRoute from './routing/protectedroute.jsx';

  // admin
  import AdminRoute from './routing/adminroute.jsx';
  import AdminLayout from './pages/admin/adminlayout.jsx';
  import AdminDashboard from './pages/admin/admindashboard.jsx';
  import UserList from './pages/admin/userlist.jsx';
  import NewProduct from './pages/admin/newproduct.jsx';
  import ProductsList from './pages/admin/productslist.jsx';
  import OrdersList from './pages/admin/orderslist.jsx';
  import Checkout from './pages/checkout.jsx';
  import MyReviews from './pages/myreviews.jsx';
  import ReviewsList from './pages/admin/reviewlist.jsx';

  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}> 
              
              {/* --- Public Routes --- */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="checkout" element={<Checkout />} />

              {/* --- User Routes (Protected) --- */}
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="rate" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>} >

                {/* These are the "child" routes */}
                <Route index element={<AdminDashboard />} /> 
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="newproduct" element={<NewProduct />} />
                <Route path="products" element={<ProductsList />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="users" element={<UserList />} />
                <Route path="reviews" element={<ReviewsList />} />
              </Route>
              
          </Route>
        </Routes>
      </Router>

    );
  }

  export default App;
