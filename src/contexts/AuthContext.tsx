import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = { name: 'Demo User', email: 'admin@lace-legacy.com', role: 'super_admin' };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    setUser(MOCK_USER);
    setIsAuthenticated(true);
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData: any) => {
    setUser({ ...MOCK_USER, ...userData });
    setIsAuthenticated(true);
    return Promise.resolve();
  };

  const forgotPassword = async (email: string) => {
    return Promise.resolve();
  };

  const resetPassword = async (token: string, password: string) => {
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 