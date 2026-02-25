import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPoolDetails } from '../../api';
import { Car, User, MapPin, Luggage, Hash, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PoolDetails() {
    const { id } = useParams();
    const [pool, setPool] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getPoolDetails(id)
            .then((res) => setPool(res.pool))
            .catch((err) => setError(err.response?.data?.error || 'Failed to fetch pool'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertTriangle size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Pool Not Found</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Link to="/book" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--color-text-dim)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
            }}>
                <ArrowLeft size={14} /> Back to Booking
            </Link>

            {/* Pool Info */}
            <div className="card glow-border" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <span className="badge badge-matched" style={{ marginBottom: '0.75rem' }}>
                            {pool.status}
                        </span>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>Pool Details</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Route Cost</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                            {pool.routeCostKm} km
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--color-border-light)',
                }}>
                    <MiniStat icon={<User size={16} />} label="Passengers" value={pool.currentPassengers} />
                    <MiniStat icon={<Luggage size={16} />} label="Luggage" value={pool.currentLuggage} />
                    <MiniStat icon={<Hash size={16} />} label="Pool ID" value={pool.id?.slice(0, 8)} mono />
                </div>
            </div>

            {/* Vehicle */}
            {pool.vehicle && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-dim)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}>
                        <Car size={14} /> Assigned Vehicle
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <DetailItem label="Driver" value={pool.vehicle.driverName} />
                        <DetailItem label="Plate" value={pool.vehicle.plateNumber} />
                        <DetailItem label="Seats" value={pool.vehicle.seats} />
                        <DetailItem label="Luggage Cap." value={pool.vehicle.luggageCapacity} />
                    </div>
                </div>
            )}

            {/* Passengers */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-dim)',
                    marginBottom: '1rem',
                }}>
                    Pooled Passengers ({pool.passengers?.length || 0})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pool.passengers?.map((p, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            background: 'var(--color-surface)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--color-border-light)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: 'white',
                                    }}>
                                        #{p.pickupOrder || i + 1}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{p.passenger?.name || 'Passenger'}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>₹{p.price}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <MapPin size={13} />
                                {p.destination?.address}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ icon, label, value, mono }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-dim)', marginBottom: '0.25rem' }}>{icon}</div>
            <div style={{ fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit', fontSize: '1.1rem' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>{label}</div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{label}</div>
            <div style={{ fontWeight: 600 }}>{value}</div>
        </div>
    );
}
