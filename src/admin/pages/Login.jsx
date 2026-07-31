import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import GlassCard from '../shared/GlassCard';
import Input from '../shared/Input';
import Button from '../shared/Button';
import './Login.css';

export default function Login({ auth }) {
  const { isAuthenticated, login } = auth;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="login-page-container">
      {/* Visual Background Glow */}
      <div className="login-bg-glow" aria-hidden="true" />

      <GlassCard className="login-card">
        {/* Brand/Header */}
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">
            <Sparkles size={20} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to manage your portfolio settings and AI models.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error-banner" role="alert">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {/* Remember me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-me-checkbox"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => alert('Password reset flow is available in Phase 02.')}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Help Note */}
        <div className="login-footer">
          <p>Demo Credentials:</p>
          <code>admin@example.com / admin123</code>
        </div>
      </GlassCard>
    </div>
  );
}
