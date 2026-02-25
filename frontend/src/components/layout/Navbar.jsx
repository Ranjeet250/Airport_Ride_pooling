import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoggedIn, logout } = useAuth();

    const links = [
        { to: '/', label: 'Home' },
        { to: '/book', label: 'Book Ride' },
        { to: '/vehicles', label: 'Vehicles' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        setOpen(false);
    };

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            {/* Logo */}
            <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
            }}>
                <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Plane size={17} color="white" />
                </div>
                <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1, #06d6a0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    AirportPool
                </span>
            </Link>

            {/* Desktop Links */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
            }} className="nav-desktop">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            color: location.pathname === link.to
                                ? 'var(--color-primary-light)'
                                : 'var(--color-text-muted)',
                            background: location.pathname === link.to
                                ? 'rgba(99, 102, 241, 0.1)'
                                : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                    >
                        {link.label}
                    </Link>
                ))}

                {/* Auth Section */}
                {isLoggedIn ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginLeft: '0.75rem',
                        paddingLeft: '0.75rem',
                        borderLeft: '1px solid var(--color-border)',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                            }}>
                                {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                            <span style={{
                                color: 'var(--color-text)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user?.name?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-dim)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-dim)'}
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="btn-primary"
                        style={{
                            marginLeft: '0.75rem',
                            padding: '0.45rem 1rem',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            borderRadius: '8px',
                        }}
                    >
                        Sign In
                    </Link>
                )}
            </div>

            {/* Mobile Toggle */}
            <button
                onClick={() => setOpen(!open)}
                className="nav-mobile-toggle"
                style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    padding: '0.3rem',
                }}
            >
                {open ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Mobile Menu */}
            {open && (
                <div className="nav-mobile-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                }}>
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setOpen(false)}
                            style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: '8px',
                                color: location.pathname === link.to
                                    ? 'var(--color-primary-light)'
                                    : 'var(--color-text-muted)',
                                background: location.pathname === link.to
                                    ? 'rgba(99, 102, 241, 0.1)'
                                    : 'transparent',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 0.75rem',
                                background: 'none',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                borderRadius: '8px',
                            }}
                        >
                            <LogOut size={16} />
                            Logout ({user?.name?.split(' ')[0]})
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setOpen(false)}
                            style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: '8px',
                                color: 'var(--color-primary-light)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                            }}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
