import { useEffect, useState } from "react";
import { Navigate } from "react-router";

interface CheckAuthProps {
  children: React.ReactNode;
  protected: boolean;
}

export default function CheckAuth({ children, protected: isProtected }: CheckAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Verify token with backend
    const verifyToken = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If route is protected and user is not authenticated, redirect to login
  if (isProtected && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If route is not protected (login/signup) and user is authenticated, redirect to home
  if (!isProtected && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 