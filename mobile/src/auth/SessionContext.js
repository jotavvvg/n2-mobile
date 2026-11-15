import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SESSION_KEY = '@delivery-ads/session';
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((storedSession) => {
        if (storedSession) setUsuario(JSON.parse(storedSession));
      })
      .catch((error) => {
        console.error('Não foi possível restaurar a sessão:', error);
      })
      .finally(() => setHydrated(true));
  }, []);

  async function signIn(nextUsuario) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUsuario));
    setUsuario(nextUsuario);
  }

  async function signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUsuario(null);
  }

  const value = useMemo(() => ({ usuario, hydrated, signIn, signOut }), [hydrated, usuario]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser usado dentro de SessionProvider.');
  return context;
}
