import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Quotes from './components/Quotes';
import Collection from './components/Collection';
import Footer from './components/Footer';
import AllProducts from './pages/AllProducts';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Admin from './pages/Admin';

const Home = () => (
  <main>
    <Hero />
    <Quotes />
    <Collection />
  </main>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
