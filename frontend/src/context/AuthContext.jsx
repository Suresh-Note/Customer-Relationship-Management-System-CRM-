import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../api/axios";
import {
  broadcastLogout,
  clearUserProfile,
  getUserProfile,
  storeUserProfile,
} from "../utils/authStorage";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUserProfile());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const { data } = await axios.get("/auth/me");

        if (!cancelled) {
          setUser(data);
          storeUserProfile(data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          clearUserProfile();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onStorageEvent(event) {
      if (event.key === "crm_logout_event") {
        setUser(null);
        clearUserProfile();
      }
    }

    window.addEventListener("storage", onStorageEvent);

    return () => {
      window.removeEventListener("storage", onStorageEvent);
    };
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    storeUserProfile(userData);
  }, []);

  const logout = useCallback(async ({ redirectTo = "/login" } = {}) => {
    let requestError = null;

    try {
      await axios.post("/auth/logout");
    } catch (error) {
      requestError = error;
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      clearUserProfile();
      broadcastLogout();
      navigate(redirectTo, { replace: true });
    }

    return {
      ok: !requestError,
      error: requestError,
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
