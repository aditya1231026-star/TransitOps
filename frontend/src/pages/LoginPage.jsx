import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
        top: '-10%', right: '-5%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        bottom: '5%', left: '5%', pointerEvents: 'none',
      }} />

      <div className="glass-panel auth-card">
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent-gradient)',
            marginBottom: 18,
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}>
            <Radio size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 6 }}>
            TransitOps
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sign in to access the admin portal
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingRight: 44 }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 18px', justifyContent: 'center', fontSize: '0.925rem' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Authenticating…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'center',
        }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Default: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>admin@transitops.com</span>
            {' '}/ <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
