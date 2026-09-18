import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth';

const ADMIN_EMAIL = 'usman.nazir.dev@gmail.com';

export default function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Strictly sync authentication status with Firebase Auth session state
  useEffect(() => {
    if (!auth) {
      setIsAuthenticated(false);
      setAdminUser(null);
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
      } else {
        // Any unauthorized session or logout immediately revokes local auth flags
        localStorage.removeItem('portfolio_admin_auth');
        localStorage.removeItem('portfolio_admin_user');
        setIsAuthenticated(false);
        setAdminUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Secure login verified exclusively through Firebase Authentication servers
  const login = useCallback(async (emailInput, passwordInput) => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPassword = (passwordInput || '').trim();

    // Check if email matches authorized administrator
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'Access Denied: Only the authorized administrator (usman.nazir.dev@gmail.com) can log in.'
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        error: 'Please enter your administrator password.'
      };
    }

    if (!auth) {
      return {
        success: false,
        error: 'Firebase Authentication service is unavailable. Please check your network connection.'
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const adminProfile = {
        email: cred.user.email,
        uid: cred.user.uid,
        role: 'Super Administrator',
        provider: 'Firebase Auth',
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('portfolio_admin_auth', 'true');
      localStorage.setItem('portfolio_admin_user', JSON.stringify(adminProfile));
      setIsAuthenticated(true);
      setAdminUser(adminProfile);

      return { success: true };
    } catch (fbErr) {
      console.error('Firebase Auth error:', fbErr.code, fbErr.message);
      let errorMsg = 'Authentication failed. Please verify your credentials.';
      if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please verify credentials or use password reset.';
      } else if (fbErr.code === 'auth/user-not-found') {
        errorMsg = 'Administrator account not registered in Firebase Authentication.';
      } else if (fbErr.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Temporarily blocked for security. Please wait a few minutes or reset your password.';
      } else if (fbErr.code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Please check your internet connection.';
      }
      return {
        success: false,
        error: errorMsg
      };
    }
  }, []);

  // Password reset service via Firebase
  const resetPassword = useCallback(async (emailInput) => {
    const cleanEmail = (emailInput || ADMIN_EMAIL).trim().toLowerCase();
    if (!auth) {
      return { success: false, error: 'Firebase Auth service is unavailable.' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { 
        success: true, 
        message: `Password reset link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.` 
      };
    } catch (err) {
      console.error('Reset password error:', err);
      return { success: false, error: err.message || 'Failed to dispatch password reset email.' };
    }
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
    resetPassword,
    logout
  };
}
