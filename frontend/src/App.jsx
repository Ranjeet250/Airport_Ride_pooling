import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BookRidePage from './pages/BookRidePage';
import RideStatusPage from './pages/RideStatusPage';
import PoolDetailsPage from './pages/PoolDetailsPage';
import VehiclesPage from './pages/VehiclesPage';
import LoginPage from './pages/LoginPage';

function AppContent() {
  const location = useLocation();
  const hideChrome = ['/book', '/login'].includes(location.pathname);

  return (
    <>
      {!hideChrome && <Navbar />}
      {location.pathname === '/book' && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/book" element={<BookRidePage />} />
          <Route path="/ride-status/:id" element={<RideStatusPage />} />
          <Route path="/pool/:id" element={<PoolDetailsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
