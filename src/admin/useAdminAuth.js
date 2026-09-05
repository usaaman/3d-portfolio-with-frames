import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const ADMIN_EMAIL = 'usman.nazir.dev@gmail.com';
const ADMIN_PASSWORD_PRIMARY = 'U sman.142';
const ADMIN_PASSWORD_FALLBACK = 'Usman.142';

export default function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('portfolio_admin_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('portfolio_admin_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth if available
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const adminProfile = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role: 'Super Administrator',
          provider: 'Firebase Auth'
        };
        localStorage.setItem('portfolio_admin_auth', 'true');
        localStorage.setItem('portfolio_admin_user', JSON.stringify(adminProfile));
        setIsAuthenticated(true);
        setAdminUser(adminProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (emailInput, passwordInput) => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    // Check if email matches exclusive admin email
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'Access Denied: Only the authorized administrator (usman.nazir.dev@gmail.com) can log in.'
      };
    }

    // Check password
    const isPasswordValid = 
      cleanPassword === ADMIN_PASSWORD_PRIMARY || 
      cleanPassword === ADMIN_PASSWORD_FALLBACK;

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials and try again.'
      };
    }

    // Attempt Firebase sync if auth is online
    let firebaseUid = 'admin_' + Date.now();
    let authProvider = 'Direct Admin Verification';

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        firebaseUid = cred.user.uid;
        authProvider = 'Firebase Auth';
      } catch (fbErr) {
        // If password in Firebase needs sync or rate-limited, local master validation allows seamless entry
        console.warn('Firebase Auth sync note:', fbErr.code, fbErr.message);
      }
    }

    const adminProfile = {
      email: ADMIN_EMAIL,
      uid: firebaseUid,
      role: 'Super Administrator',
      provider: authProvider,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('portfolio_admin_auth', 'true');
    localStorage.setItem('portfolio_admin_user', JSON.stringify(adminProfile));
    setIsAuthenticated(true);
    setAdminUser(adminProfile);

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('portfolio_admin_auth');
    localStorage.removeItem('portfolio_admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);

    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  }, []);

  return {
    isAuthenticated,
    adminUser,
    loading,
    login,
    logout
  };
}
