import { Check, X } from 'lucide-react';

export default function PricingPreview() {
    const plans = [
        {
            name: 'Solo Ride',
            price: '₹290',
            desc: 'Direct ride, no sharing',
            features: [
                { text: 'Private vehicle', included: true },
                { text: 'Fastest route', included: true },
                { text: 'No co-passengers', included: true },
                { text: 'Pool discount', included: false },
                { text: 'Eco-friendly', included: false },
            ],
            highlight: false,
        },
        {
            name: 'Pooled Ride',
            price: '₹218',
            desc: 'Share & save up to 25%',
            save: '25% OFF',
            features: [
                { text: 'Shared vehicle', included: true },
                { text: 'Optimized route', included: true },
                { text: 'Up to 3 co-passengers', included: true },
                { text: '25% pool discount', included: true },
                { text: 'Lower emissions', included: true },
            ],
            highlight: true,
        },
    ];

    return (
        <section className="section">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h2 className="section-title">
                    Transparent <span className="gradient-text">Pricing</span>
                </h2>
                <p className="section-subtitle" style={{ margin: '0 auto' }}>
                    Base fare ₹50 + ₹12/km · Dynamic demand multiplier · Pool discount 25%
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                maxWidth: '700px',
                margin: '0 auto',
            }}>
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={plan.highlight ? 'glow-border' : 'card'}
                        style={{
                            padding: '2.5rem 2rem',
                            borderRadius: 'var(--radius-lg)',
                            position: 'relative',
                            background: plan.highlight
                                ? 'var(--gradient-card)'
                                : 'var(--color-bg-card)',
                            border: plan.highlight
                                ? '1px solid var(--color-border)'
                                : '1px solid var(--color-border-light)',
                        }}
                    >
                        {plan.save && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '1.5rem',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                padding: '0.3rem 0.9rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                            }}>
                                {plan.save}
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            {plan.name}
                        </h3>
                        <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                            {plan.desc}
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{plan.price}</span>
                            <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}> /20km</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {plan.features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    {f.included ? (
                                        <Check size={16} style={{ color: 'var(--color-accent)' }} />
                                    ) : (
                                        <X size={16} style={{ color: 'var(--color-text-dim)' }} />
                                    )}
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: f.included ? 'var(--color-text)' : 'var(--color-text-dim)',
                                    }}>
                                        {f.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
