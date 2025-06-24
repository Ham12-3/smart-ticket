import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();

  // Handle token on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // Handle scroll effect for floating nav
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className={`floating-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold luxury-heading">Smart Ticket</span>
        </Link>

        <div className="flex items-center space-x-6">
          {token ? (
            <>
              <Link 
                to="/tickets" 
                className="luxury-text hover:text-white transition-colors font-medium"
              >
                Tickets
              </Link>
              <Link 
                to="/admin" 
                className="luxury-text hover:text-white transition-colors font-medium"
              >
                Admin
              </Link>
              <button 
                onClick={handleLogout}
                className="btn-luxury-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="luxury-text hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn-luxury-primary"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 