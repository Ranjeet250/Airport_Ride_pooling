import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRideStatus, cancelRide } from '../../api';
import { Loader2, CheckCircle2, XCircle, Clock, Users, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { icon: <Clock size={20} />, badge: 'badge-pending', label: 'Pending Match', color: '#fbbf24' },
    MATCHED: { icon: <CheckCircle2 size={20} />, badge: 'badge-matched', label: 'Matched!', color: '#06d6a0' },
    IN_TRANSIT: { icon: <Users size={20} />, badge: 'badge-matched', label: 'In Transit', color: '#06d6a0' },
    COMPLETED: { icon: <CheckCircle2 size={20} />, badge: 'badge-completed', label: 'Completed', color: '#818cf8' },
    CANCELLED: { icon: <XCircle size={20} />, badge: 'badge-cancelled', label: 'Cancelled', color: '#f87171' },
};

export default function RideStatusTracker() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [polling, setPolling] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!id || !polling) return;

        const fetchStatus = () => {
            getRideStatus(id)
                .then((res) => {
                    setData(res);
                    if (['MATCHED', 'COMPLETED', 'CANCELLED'].includes(res.status)) {
                        setPolling(false);
                    }
                })
                .catch((err) => {
                    setError(err.response?.data?.error || 'Failed to fetch status');
                    setPolling(false);
                });
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [id, polling]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this ride?')) return;
        setCancelling(true);
        try {
            await cancelRide(id);
            setData((prev) => ({ ...prev, status: 'CANCELLED' }));
            setPolling(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel ride');
        } finally {
            setCancelling(false);
        }
    };

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertTriangle size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Error</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                <Link to="/book" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                    Try Again
                </Link>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Loading ride status...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.PENDING;

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            {/* Status Card */}
            <div className="card animate-pulse-glow" style={{
                textAlign: 'center',
                padding: '2.5rem 2rem',
                borderColor: `${config.color}30`,
                marginBottom: '1.5rem',
            }}>
                <div style={{ color: config.color, marginBottom: '1rem' }}>
                    {config.icon}
                </div>
                <span className={`badge ${config.badge}`} style={{ fontSize: '0.85rem', padding: '0.35rem 1rem' }}>
                    {config.label}
                </span>

                {polling && (
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', marginTop: '1rem' }}>
                        ⟳ Polling every 2 seconds...
                    </p>
                )}
            </div>

            {/* Details */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    Ride Details
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <DetailRow label="Ride Request ID" value={data.rideRequestId} mono />
                    <DetailRow label="Status" value={data.status} />
                    {data.direction && <DetailRow label="Direction" value={data.direction === 'TO_AIRPORT' ? 'Location → Airport' : 'Airport → Location'} />}
                    {data.destAddress && <DetailRow label="Destination" value={data.destAddress} />}
                    {data.price && <DetailRow label="Price" value={`₹${data.price}`} accent />}
                    {data.poolId && <DetailRow label="Pool ID" value={data.poolId} mono />}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {data.poolId && (
                    <Link to={`/pool/${data.poolId}`} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        View Pool Details
                    </Link>
                )}

                {['PENDING', 'MATCHED'].includes(data.status) && (
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="btn-secondary"
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                        }}
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel Ride'}
                    </button>
                )}

                <Link to="/book" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Book Another
                </Link>
            </div>
        </div>
    );
}

function DetailRow({ label, value, mono, accent }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>{label}</span>
            <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                fontFamily: mono ? 'monospace' : 'inherit',
                color: accent ? 'var(--color-accent)' : 'var(--color-text)',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {value}
            </span>
        </div>
    );
}
