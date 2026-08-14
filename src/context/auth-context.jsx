import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

function mapUser(data) {
  return {
    ...data,
    id: data._id || data.id,
    name: data.fullName || data.name,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth
        .getMe()
        .then((data) => {
          setUser(mapUser(data));
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.auth.login({ email, password });
    localStorage.setItem("token", response.token);
    const mappedUser = mapUser(response.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const register = async (userData) => {
    // Generate unique username from email + timestamp suffix
    const emailPrefix = userData.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "");
    const timestamp = Date.now().toString().slice(-4);
    const username = `${emailPrefix}_${timestamp}`.toLowerCase();
    const payload = {
      username,
      email: userData.email.toLowerCase(),
      password: userData.password,
      fullName: userData.name,
      role: "member",
    };
    const response = await api.auth.register(payload);
    localStorage.setItem("token", response.token);
    const mappedUser = mapUser(response.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
