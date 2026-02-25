import { Plane, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--color-border-light)',
            padding: '3rem 1.5rem',
            background: 'rgba(10, 14, 26, 0.95)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{
                            background: 'var(--gradient-primary)',
                            borderRadius: '10px',
                            padding: '0.35rem',
                            display: 'flex',
                        }}>
                            <Plane size={18} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            Airport<span className="gradient-text">Pool</span>
                        </span>
                    </div>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        Smart ride pooling from Chennai Airport. Save money, share rides, reduce emissions.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                        Quick Links
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <Link to="/" style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', transition: 'color 0.2s' }}>Home</Link>
                        <Link to="/book" style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', transition: 'color 0.2s' }}>Book a Ride</Link>
                        <Link to="/vehicles" style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', transition: 'color 0.2s' }}>Available Vehicles</Link>
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                        Connect
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <a href="https://github.com" target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'var(--color-text-dim)', fontSize: '0.875rem',
                        }}>
                            <Github size={16} /> GitHub
                        </a>
                        <a href="mailto:contact@airportpool.com" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'var(--color-text-dim)', fontSize: '0.875rem',
                        }}>
                            <Mail size={16} /> Contact Us
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1200px',
                margin: '2rem auto 0',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
            }}>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                    © {new Date().getFullYear()} AirportPool. All rights reserved.
                </p>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                    Built with Node.js + React
                </p>
            </div>
        </footer>
    );
}
