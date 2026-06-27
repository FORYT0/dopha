import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Toast from './components/Toast'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import ProjectLabPage from './pages/ProjectLabPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <CartSidebar />
        <Toast />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/project-lab" element={<ProjectLabPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
