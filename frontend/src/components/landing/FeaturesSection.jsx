import { Brain, DollarSign, Shield, Zap, MapPin, Clock } from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: <Brain size={24} />,
            title: 'Smart Matching',
            desc: 'Greedy spatial clustering algorithm groups passengers heading in similar directions.',
            color: '#6366f1',
        },
        {
            icon: <DollarSign size={24} />,
            title: 'Dynamic Pricing',
            desc: 'Real-time fare based on demand, distance, pool discounts, and detour penalties.',
            color: '#06d6a0',
        },
        {
            icon: <Shield size={24} />,
            title: 'Concurrency Safe',
            desc: 'Redis distributed locks + optimistic versioning prevent double-booking race conditions.',
            color: '#f59e0b',
        },
        {
            icon: <Zap size={24} />,
            title: 'Fast Matching',
            desc: 'Sub-second pool matching with O(P×24) complexity using BullMQ async queue.',
            color: '#ef4444',
        },
        {
            icon: <MapPin size={24} />,
            title: 'Route Optimization',
            desc: 'Brute-force permutation finds optimal drop-off order for up to 4 passengers.',
            color: '#8b5cf6',
        },
        {
            icon: <Clock size={24} />,
            title: 'Real-Time Status',
            desc: 'Poll your ride status in real-time from PENDING to MATCHED to COMPLETED.',
            color: '#06b6d4',
        },
    ];

    return (
        <section className="section" style={{ background: 'rgba(17, 24, 39, 0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h2 className="section-title">
                    Powered by <span className="gradient-text">Intelligence</span>
                </h2>
                <p className="section-subtitle" style={{ margin: '0 auto' }}>
                    Production-grade features built for reliability and performance
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {features.map((f, i) => (
                    <div key={i} className="card" style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `${f.color}12`,
                            border: `1px solid ${f.color}25`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: f.color,
                            flexShrink: 0,
                        }}>
                            {f.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                                {f.title}
                            </h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                {f.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
