import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Mail, ArrowRight, Loader2, AlertCircle, User, Shield, Phone, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginPassenger, registerPassenger, getAllPassengers } from '../api';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [quickUsers, setQuickUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    if (isLoggedIn) {
        navigate('/book');
        return null;
    }

    // Fetch users from API
    useEffect(() => {
        setLoadingUsers(true);
        getAllPassengers()
            .then((data) => setQuickUsers((data.passengers || []).slice(0, 6)))
            .catch(() => setQuickUsers([]))
            .finally(() => setLoadingUsers(false));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!email.trim()) return setError('Please enter your email');

        setLoading(true);
        try {
            const data = await loginPassenger(email.trim());
            login(data.passenger);
            navigate('/book');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name.trim()) return setError('Name is required');
        if (!email.trim()) return setError('Email is required');
        if (!phone.trim()) return setError('Phone is required');

        setLoading(true);
        try {
            const data = await registerPassenger(name.trim(), email.trim(), phone.trim());
            login(data.passenger);
            navigate('/book');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchToMode = (m) => {
        setMode(m);
        setError('');
        setSuccess('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glows */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-15%', right: '-10%', width: '400px', height: '400px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 214, 160, 0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeInUp 0.6s ease-out' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)', marginBottom: '1.25rem',
                    }}>
                        <Plane size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                        {mode === 'login' ? 'Welcome back!' : 'Create account'}
                    </h1>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                        {mode === 'login' ? 'Sign in to book your pooled ride' : 'Join AirportPool in seconds'}
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: '20px', padding: '1.75rem',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
                }}>
                    {/* Tab Switcher */}
                    <div style={{
                        display: 'flex', gap: '0.25rem', padding: '0.25rem',
                        background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                        marginBottom: '1.5rem',
                    }}>
                        <button
                            onClick={() => switchToMode('login')}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.4rem', padding: '0.6rem',
                                background: mode === 'login' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                border: mode === 'login' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                borderRadius: '10px', cursor: 'pointer',
                                color: mode === 'login' ? 'var(--color-primary-light)' : 'var(--color-text-dim)',
                                fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                            }}
                        >
                            <LogIn size={14} /> Sign In
                        </button>
                        <button
                            onClick={() => switchToMode('register')}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.4rem', padding: '0.6rem',
                                background: mode === 'register' ? 'rgba(6, 214, 160, 0.12)' : 'transparent',
                                border: mode === 'register' ? '1px solid rgba(6, 214, 160, 0.2)' : '1px solid transparent',
                                borderRadius: '10px', cursor: 'pointer',
                                color: mode === 'register' ? '#06d6a0' : 'var(--color-text-dim)',
                                fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                            }}
                        >
                            <UserPlus size={14} /> Register
                        </button>
                    </div>

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin}>
                            <InputField
                                icon={<Mail size={15} />}
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(v) => { setEmail(v); setError(''); }}
                                error={error}
                                autoFocus
                            />

                            {error && <ErrorMsg msg={error} />}
                            {success && <SuccessMsg msg={success} />}

                            <SubmitBtn loading={loading} text="Sign In" icon={<ArrowRight size={16} />} />
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister}>
                            <InputField
                                icon={<User size={15} />}
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(v) => { setName(v); setError(''); }}
                                autoFocus
                            />
                            <InputField
                                icon={<Mail size={15} />}
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(v) => { setEmail(v); setError(''); }}
                            />
                            <InputField
                                icon={<Phone size={15} />}
                                label="Phone"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(v) => { setPhone(v); setError(''); }}
                            />

                            {error && <ErrorMsg msg={error} />}
                            {success && <SuccessMsg msg={success} />}

                            <SubmitBtn loading={loading} text="Create Account" icon={<UserPlus size={16} />} color="#06d6a0" />
                        </form>
                    )}

                    {/* Quick Login (login mode only) */}
                    {mode === 'login' && (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0',
                            }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                                <span style={{ color: 'var(--color-text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Quick sign in
                                </span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                            </div>

                            {loadingUsers ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-dim)' }}>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : quickUsers.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                    {quickUsers.map((q) => (
                                        <button
                                            key={q.email}
                                            type="button"
                                            onClick={() => { setEmail(q.email); setError(''); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.45rem',
                                                padding: '0.5rem 0.65rem',
                                                background: email === q.email ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                                border: `1px solid ${email === q.email ? 'rgba(99, 102, 241, 0.3)' : 'var(--color-border)'}`,
                                                borderRadius: '10px', color: 'var(--color-text)',
                                                cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.78rem', fontWeight: 500,
                                            }}
                                        >
                                            <div style={{
                                                width: '26px', height: '26px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {q.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {q.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                                    No users yet — register to get started!
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div style={{
                    textAlign: 'center', marginTop: '1.25rem',
                    color: 'var(--color-text-dim)', fontSize: '0.72rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}>
                    <Shield size={11} />
                    {mode === 'login' ? 'Use a registered email or create a new account' : 'Your data stays secure'}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

// ── Reusable Sub-Components ───────────────────

function InputField({ icon, label, type, placeholder, value, onChange, error, autoFocus }) {
    return (
        <div style={{ marginBottom: '0.9rem' }}>
            <label style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)',
                marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>
                {icon} {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: 'var(--color-bg)',
                border: `1.5px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'var(--color-border)'}`,
                borderRadius: '12px', padding: '0 0.85rem', transition: 'border-color 0.2s',
            }}>
                <span style={{ color: 'var(--color-text-dim)', flexShrink: 0, display: 'flex' }}>{icon}</span>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    style={{
                        width: '100%', padding: '0.7rem 0', background: 'transparent',
                        border: 'none', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none',
                    }}
                />
            </div>
        </div>
    );
}

function ErrorMsg({ msg }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.55rem 0.75rem', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px',
            color: '#f87171', fontSize: '0.82rem', marginBottom: '0.9rem',
        }}>
            <AlertCircle size={13} /> {msg}
        </div>
    );
}

function SuccessMsg({ msg }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.55rem 0.75rem', background: 'rgba(6, 214, 160, 0.08)',
            border: '1px solid rgba(6, 214, 160, 0.2)', borderRadius: '10px',
            color: '#06d6a0', fontSize: '0.82rem', marginBottom: '0.9rem',
        }}>
            <CheckCircle size={13} /> {msg}
        </div>
    );
}

function SubmitBtn({ loading, text, icon, color = '#6366f1' }) {
    return (
        <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
                width: '100%', justifyContent: 'center', padding: '0.8rem',
                fontSize: '0.95rem', borderRadius: '12px', fontWeight: 700,
                opacity: loading ? 0.7 : 1,
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            }}
        >
            {loading ? (
                <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {text === 'Create Account' ? 'Creating...' : 'Signing in...'}
                </>
            ) : (
                <>
                    {text}
                    {icon}
                </>
            )}
        </button>
    );
}
