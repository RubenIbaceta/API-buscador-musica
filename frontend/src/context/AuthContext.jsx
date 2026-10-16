import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const interceptor = api.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) setUser(null);
      return Promise.reject(error);
    });
    api.get('/auth/me', { signal: controller.signal }).then(({ data }) => setUser(data.user)).catch(() => {}).finally(() => { if (!controller.signal.aborted) setReady(true); });
    api.get('/health', { signal: controller.signal }).then(({ data }) => setMode(data.mode)).catch(() => {});
    return () => { controller.abort(); api.interceptors.response.eject(interceptor); };
  }, []);
  async function authenticate(kind, values) {
    const { data } = await api.post(`/auth/${kind}`, values);
    setUser(data.user); return data.user;
  }
  async function logout() { await api.post('/auth/logout'); setUser(null); }
  return <AuthContext.Provider value={{ user, ready, mode, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
