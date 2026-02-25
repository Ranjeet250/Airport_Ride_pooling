import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: 'Priya Sharma',
            role: 'Frequent Flyer',
            text: 'Saved ₹200 on my ride from the airport! The matching was instant and my co-passenger was heading to the same area.',
            rating: 5,
        },
        {
            name: 'Arjun Mehta',
            role: 'Business Traveler',
            text: 'The route optimization is impressive. Even with 3 passengers, we reached faster than expected. Dynamic pricing is very fair.',
            rating: 5,
        },
        {
            name: 'Kavitha R.',
            role: 'Student',
            text: 'As a student, every rupee matters. The pool discount makes airport rides actually affordable. Great concept!',
            rating: 4,
        },
    ];

    return (
        <section className="section" style={{ background: 'rgba(17, 24, 39, 0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h2 className="section-title">
                    What Riders <span className="gradient-text">Say</span>
                </h2>
                <p className="section-subtitle" style={{ margin: '0 auto' }}>
                    Real feedback from real passengers
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
            }}>
                {testimonials.map((t, i) => (
                    <div key={i} className="card" style={{ padding: '2rem', position: 'relative' }}>
                        <Quote
                            size={32}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1.25rem',
                                color: 'rgba(99, 102, 241, 0.1)',
                            }}
                        />

                        {/* Stars */}
                        <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                            {Array.from({ length: 5 }).map((_, si) => (
                                <Star
                                    key={si}
                                    size={14}
                                    fill={si < t.rating ? '#f59e0b' : 'transparent'}
                                    style={{ color: si < t.rating ? '#f59e0b' : 'var(--color-text-dim)' }}
                                />
                            ))}
                        </div>

                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.95rem',
                            lineHeight: 1.7,
                            marginBottom: '1.5rem',
                            fontStyle: 'italic',
                        }}>
                            &ldquo;{t.text}&rdquo;
                        </p>

                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                            <div style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>{t.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
