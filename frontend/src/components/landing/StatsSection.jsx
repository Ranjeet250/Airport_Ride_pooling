import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Users, Car, MapPin } from 'lucide-react';

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = Date.now();
                    const step = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
    const stats = [
        { icon: <Users size={24} />, value: 1500, suffix: '+', label: 'Passengers Served', color: '#6366f1' },
        { icon: <TrendingUp size={24} />, value: 25, suffix: '%', label: 'Average Savings', color: '#06d6a0' },
        { icon: <Car size={24} />, value: 10, suffix: '', label: 'Vehicles Fleet', color: '#f59e0b' },
        { icon: <MapPin size={24} />, value: 50, suffix: '+', label: 'Destinations Covered', color: '#8b5cf6' },
    ];

    return (
        <section style={{
            padding: '4rem 1.5rem',
            background: 'rgba(17, 24, 39, 0.5)',
            borderTop: '1px solid var(--color-border-light)',
            borderBottom: '1px solid var(--color-border-light)',
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '2rem',
                textAlign: 'center',
            }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ padding: '1rem' }}>
                        <div style={{
                            color: s.color,
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '0.75rem',
                        }}>
                            {s.icon}
                        </div>
                        <div style={{
                            fontSize: '2.25rem',
                            fontWeight: 900,
                            color: 'var(--color-text)',
                            letterSpacing: '-0.02em',
                        }}>
                            <AnimatedCounter target={s.value} suffix={s.suffix} />
                        </div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--color-text-dim)',
                            marginTop: '0.25rem',
                        }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
