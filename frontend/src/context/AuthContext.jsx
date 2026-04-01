import { createContext, useContext, useEffect, useState } from "react";

import api, { clearToken, setToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, updateToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      setToken(token);
    } else {
      clearToken();
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    updateToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/register", payload);
    return data;
  };

  const setupAdmin = async (payload) => {
    const { data } = await api.post("/setup-admin", payload);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      // Token may already be invalid or absent.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      updateToken(null);
      setUser(null);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    register,
    setupAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
