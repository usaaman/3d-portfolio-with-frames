import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin({ auth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (auth?.isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await auth.login(email, password);
      if (res.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfoMsg('');
    const targetEmail = email.trim() || 'usman.nazir.dev@gmail.com';
    setIsResetting(true);
    try {
      const res = await auth.resetPassword(targetEmail);
      if (res.success) {
        setInfoMsg(res.message);
      } else {
        setError(res.error || 'Failed to dispatch password reset email.');
      }
    } catch (err) {
      setError('Unable to send password reset email at this moment.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-ambient" />

      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-badge-icon">
            <Shield size={32} />
          </div>
          <h1 className="admin-login-title">Admin Console</h1>
          <p className="admin-login-subtitle">Muhammad Usman's Portfolio Control Center</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="admin-login-success">
            <span>✓ {infoMsg}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-field-group">
            <label className="admin-field-label" htmlFor="admin-email">
              Administrator Email
            </label>
            <div className="admin-input-wrapper">
              <input
                id="admin-email"
                type="email"
                className="admin-input"
                placeholder="usman.nazir.dev@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail className="admin-field-icon" size={18} />
            </div>
          </div>

          <div className="admin-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="admin-field-label" htmlFor="admin-password">
                Master Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="admin-forgot-btn"
              >
                {isResetting ? 'Sending link...' : 'Forgot password?'}
              </button>
            </div>
            <div className="admin-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock className="admin-field-icon" size={18} />
              <button
                type="button"
                className="admin-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="admin-spin-loader" size={18} />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Unlock Admin Console</span>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="admin-return-link">
            <ArrowLeft size={16} />
            <span>Return to Live Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
