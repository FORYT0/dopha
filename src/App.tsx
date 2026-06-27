import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { StaffProvider } from './context/StaffContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Toast from './components/Toast'
import StaffBar from './components/StaffBar'
import Home from './pages/Home'
import ProductsPage from './pages/ProductsPage'
import ProjectLabPage from './pages/ProjectLabPage'
import AboutPage from './pages/AboutPage'
import { useStaff } from './context/StaffContext'

function AppShell() {
  const { isStaff } = useStaff();
  return (
    <div className="min-h-screen bg-white">
      {isStaff && <StaffBar />}
      <div className={isStaff ? 'pt-9' : ''}>
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
    </div>
  );
}

export default function App() {
  return (
    <StaffProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </StaffProvider>
  )
}
