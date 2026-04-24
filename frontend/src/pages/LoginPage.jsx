import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const ROLES = [
  { key: 'admin', label: 'Admin', emoji: '🛡️' },
  { key: 'faculty', label: 'Faculty', emoji: '👨‍🏫' },
  { key: 'student', label: 'Student', emoji: '🎓' },
];

const REDIRECT = { admin: '/admin', faculty: '/faculty', student: '/student' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password, role);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate(REDIRECT[role]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🎓</div>
          <div>
            <h1>Acad<span>Track</span></h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Academic Management System
            </p>
          </div>
        </div>

        <p className="login-subtitle">Sign in to your account to continue</p>

        {/* Role Selector */}
        <div className="role-tabs">
          {ROLES.map((r) => (
            <button
              key={r.key}
              className={`role-tab${role === r.key ? ' active' : ''}`}
              onClick={() => { setRole(r.key); setErrors({}); }}
              type="button"
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18
              }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 38 }}
                placeholder="your@email.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
                autoComplete="email"
                id="login-email"
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: 38, paddingRight: 42 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })); }}
                autoComplete="current-password"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                }}
              >
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              `Sign in as ${ROLES.find(r => r.key === role)?.label}`
            )}
          </button>
        </form>

        <div style={{
          marginTop: 28, padding: '16px', background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)'
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Default Admin:</strong>{' '}
          admin@acadtrack.edu / Admin@1234
        </div>
      </div>
    </div>
  );
}
