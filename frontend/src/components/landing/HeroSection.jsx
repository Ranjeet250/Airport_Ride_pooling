import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';

export default function HeroSection() {
    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--gradient-hero)',
            paddingTop: '5rem',
        }}>
            {/* Decorative orbs */}
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                top: '-100px',
                right: '-100px',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,214,160,0.1) 0%, transparent 70%)',
                bottom: '-50px',
                left: '-50px',
                pointerEvents: 'none',
            }} />

            <div style={{
                maxWidth: '800px',
                textAlign: 'center',
                padding: '2rem 1.5rem',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Badge */}
                <div className="animate-fade-in-up" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.85rem',
                    color: 'var(--color-primary-light)',
                    fontWeight: 500,
                    marginBottom: '1.5rem',
                }}>
                    <Sparkles size={14} />
                    Smart Airport Ride Pooling
                </div>

                {/* Headline */}
                <h1 className="animate-fade-in-up" style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.03em',
                    animationDelay: '0.1s',
                }}>
                    Share Your Ride,{' '}
                    <span className="gradient-text">Split the Cost</span>
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-in-up" style={{
                    fontSize: '1.2rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem',
                    lineHeight: 1.7,
                    animationDelay: '0.2s',
                }}>
                    Intelligent ride pooling from Chennai Airport. Our algorithm matches you with
                    nearby passengers, optimizes routes, and saves you up to <strong style={{ color: 'var(--color-accent)' }}>25%</strong> on fares.
                </p>

                {/* CTAs */}
                <div className="animate-fade-in-up" style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    animationDelay: '0.3s',
                }}>
                    <Link to="/book" className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
                        Book a Ride <ArrowRight size={18} />
                    </Link>
                    <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
                        <MapPin size={18} /> How It Works
                    </a>
                </div>

                {/* Mini stats */}
                <div className="animate-fade-in-up" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '3rem',
                    marginTop: '4rem',
                    flexWrap: 'wrap',
                    animationDelay: '0.4s',
                }}>
                    {[
                        { value: '2,500+', label: 'Rides Pooled' },
                        { value: '25%', label: 'Avg Savings' },
                        { value: '< 5s', label: 'Match Time' },
                    ].map((stat) => (
                        <div key={stat.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
