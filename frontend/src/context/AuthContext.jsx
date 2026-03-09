import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client'; // <-- ADD THIS

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null); // <-- ADD THIS

  // Check if the user is already logged in when they open the app
  useEffect(() => {
    const token = localStorage.getItem('lectro_token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Check if token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decodedUser);
          connectSocket(decodedUser.id); // <-- ADD THIS
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // <-- ADD THIS FUNCTION
  const connectSocket = (userId) => {
    const newSocket = io('http://localhost:5000');
    newSocket.on('connect', () => {
      newSocket.emit('register', userId);
    });
    setSocket(newSocket);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      // Save token to browser storage
      localStorage.setItem('lectro_token', token);
      
      // Decode the token to get the user's ID and Role
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      connectSocket(decodedUser.id); // <-- ADD THIS
      
      return decodedUser.role; // Return role so the Login page knows where to redirect them
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('lectro_token');
    setUser(null);
    if (socket) socket.disconnect(); // <-- ADD THIS
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to make it easy to use AuthContext in any file
export const useAuth = () => useContext(AuthContext);