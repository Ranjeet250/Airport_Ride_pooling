import { Users, Route, ArrowDownRight } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            icon: <ArrowDownRight size={28} />,
            title: 'Request a Ride',
            desc: 'Enter your destination, luggage count, and detour tolerance from the airport.',
            color: '#6366f1',
        },
        {
            icon: <Users size={28} />,
            title: 'Get Matched',
            desc: 'Our algorithm finds passengers heading nearby and pools you together in seconds.',
            color: '#06d6a0',
        },
        {
            icon: <Route size={28} />,
            title: 'Ride & Save',
            desc: 'Share the optimized route, split the fare, and enjoy up to 25% savings.',
            color: '#f59e0b',
        },
    ];

    return (
        <section id="how-it-works" className="section">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h2 className="section-title">
                    How It <span className="gradient-text">Works</span>
                </h2>
                <p className="section-subtitle" style={{ margin: '0 auto' }}>
                    Three simple steps from landing to your doorstep
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
            }}>
                {steps.map((step, i) => (
                    <div key={i} className="card" style={{
                        textAlign: 'center',
                        padding: '2.5rem 2rem',
                        position: 'relative',
                    }}>
                        {/* Step Number */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1.25rem',
                            fontSize: '3rem',
                            fontWeight: 900,
                            color: 'rgba(255,255,255,0.03)',
                            lineHeight: 1,
                        }}>
                            {String(i + 1).padStart(2, '0')}
                        </div>

                        {/* Icon */}
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: `${step.color}15`,
                            border: `1px solid ${step.color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            color: step.color,
                        }}>
                            {step.icon}
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                            {step.title}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
