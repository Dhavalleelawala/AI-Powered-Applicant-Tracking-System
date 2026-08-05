import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('rolefit_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rolefit_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  const persist = (session) => {
    const nextToken = session.token;
    const nextUser = { ...(user || {}), ...(session.user || {}) };
    localStorage.setItem('rolefit_token', nextToken);
    localStorage.setItem('rolefit_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('rolefit_token');
    localStorage.removeItem('rolefit_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    authApi
      .me()
      .then((res) => {
        if (!active) return;
        const nextUser = res.data?.user || res.data;
        setUser(nextUser);
        localStorage.setItem('rolefit_user', JSON.stringify(nextUser));
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, login: persist, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
