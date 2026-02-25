import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
    return (
        <section style={{
            padding: '5rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em',
                }}>
                    Ready to <span className="gradient-text">Pool & Save</span>?
                </h2>
                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    margin: '0 auto 2rem',
                    lineHeight: 1.7,
                }}>
                    Book your pooled ride from Chennai Airport now and save up to 25% on your fare.
                </p>
                <Link to="/book" className="btn-primary" style={{
                    fontSize: '1.1rem',
                    padding: '1rem 2.5rem',
                }}>
                    Book Your Ride <ArrowRight size={20} />
                </Link>
            </div>
        </section>
    );
}
