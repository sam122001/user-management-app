import React, { createContext, useContext, useState, useEffect } from 'react';
import { JwtPayload, jwtDecode } from 'jwt-decode';


interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtPayload | null;  // Change the type to JwtPayload | null
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<JwtPayload | null>(null);  // Same change here
 
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decoded.exp && decoded.exp < currentTime) {
        logout(); // Token is expired; log the user out
      } else {
        setUser(decoded);
        setIsAuthenticated(true);
        console.log('token')
      }
    }
  }, []);
  

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<JwtPayload>(token);  // Explicitly define the type here
    setUser(decoded);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
