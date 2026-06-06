import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('vault_token');
    const storedUser  = localStorage.getItem('vault_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('vault_token');
        localStorage.removeItem('vault_user');
      }
    }
    setLoading(false);
  }, []);

  const persistAuth = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('vault_token', tokenValue);
    localStorage.setItem('vault_user', JSON.stringify(userData));
  };

  const register = useCallback(async (fullName, email, password) => {
    const response = await authApi.register({ fullName, email, password });
    const { user: userData, token: tokenValue } = response.data.data;
    persistAuth(userData, tokenValue);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: userData, token: tokenValue } = response.data.data;
    persistAuth(userData, tokenValue);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
