import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  function loadFromStorage() {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    const payload = decodeJwt(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.clear();
      setUser(null);
    } else {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ id: payload.id || payload.sub, role: payload.role, name: payload.name });
        }
      } else {
        setUser({ id: payload.id || payload.sub, role: payload.role, name: payload.name });
      }
    }
    setReady(true);
  }

  useEffect(() => {
    loadFromStorage();
    window.addEventListener("storage", loadFromStorage);
    return () => window.removeEventListener("storage", loadFromStorage);
  }, []);

  function setAuthSession(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  async function quickDemoLogin(role = "SHIPPER") {
    try {
      const { data } = await api.post("/auth/demo-login", { role });
      setAuthSession(data.token, data.user);
      return data.user;
    } catch (err) {
      console.error("Demo login error:", err);
      throw err;
    }
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        setAuthSession,
        quickDemoLogin,
        refresh: loadFromStorage,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
