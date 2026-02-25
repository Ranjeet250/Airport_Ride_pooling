import { useState, useEffect } from 'react';
import { getAvailableVehicles } from '../../api';
import { Car, User, Luggage, MapPin, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, limit: 12, offset: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchVehicles = (offset = 0) => {
        setLoading(true);
        getAvailableVehicles(pagination.limit, offset)
            .then((res) => {
                setVehicles(res.vehicles);
                setPagination(res.pagination);
            })
            .catch((err) => setError(err.response?.data?.error || 'Failed to fetch vehicles. Is the backend running?'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchVehicles(); }, []);

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Connection Error</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{error}</p>
                <button onClick={() => { setError(''); fetchVehicles(); }} className="btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Loading vehicles...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {pagination.total} vehicles available
                </p>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
            }}>
                {vehicles.map((v) => (
                    <div key={v.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary)',
                            }}>
                                <Car size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{v.plateNumber}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>{v.driverName}</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--color-border-light)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <User size={14} /> {v.seats} seats
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <Luggage size={14} /> {v.luggageCapacity} bags
                            </div>
                            <div style={{
                                gridColumn: '1 / -1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-dim)',
                            }}>
                                <MapPin size={13} /> {v.currentLat?.toFixed(4)}, {v.currentLng?.toFixed(4)}
                            </div>
                        </div>

                        <div style={{ marginTop: '0.75rem' }}>
                            <span className="badge badge-matched">
                                {v.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '2rem',
                }}>
                    <button
                        className="btn-secondary"
                        disabled={pagination.offset === 0}
                        onClick={() => fetchVehicles(Math.max(0, pagination.offset - pagination.limit))}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                        className="btn-secondary"
                        disabled={pagination.offset + pagination.limit >= pagination.total}
                        onClick={() => fetchVehicles(pagination.offset + pagination.limit)}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
