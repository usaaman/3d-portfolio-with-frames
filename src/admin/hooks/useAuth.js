import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_authenticated');
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    if (!auth) {
      // Fallback local mock mode if firebase is offline
      if (email === 'admin@example.com' && password === 'admin123') {
        localStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Firebase Auth offline. Default credentials check failed.' };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Firebase Auth error:', error);
      let errorMsg = 'Invalid email or password.';
      if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect login credentials.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = 'Network failure. Check internet connection.';
      }
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) {
      localStorage.removeItem('admin_authenticated');
      setIsAuthenticated(false);
      return;
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    isAuthenticated,
    loading,
    login,
    logout,
  };
}
