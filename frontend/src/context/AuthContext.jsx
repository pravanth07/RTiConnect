import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("rti_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    // Call the real backend API instead of mocking
    const res = await authAPI.login({ email, password });
    
    // Extract user and token from the successful response
    const { user, token } = res.data;

    // Store both token and user object
    localStorage.setItem("rti_token", token);
    localStorage.setItem("rti_user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("rti_user");
    localStorage.removeItem("rti_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);