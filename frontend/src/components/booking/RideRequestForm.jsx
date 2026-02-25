import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Luggage, SlidersHorizontal, Loader2, Navigation, X, Plane, LogOut, ChevronDown, ArrowDownUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestRide, getFareEstimate, getAirports, getDestinations } from '../../api';
import 'leaflet/dist/leaflet.css';

// ── Icons ─────────────────────────────────────
const createIcon = (color, emoji) => L.divIcon({
    className: '',
    html: `<div style="
    width: 42px; height: 42px; border-radius: 50%;
    background: ${color}; border: 3px solid white;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    position: relative;
  ">${emoji}<div style="
    position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0; border-left: 6px solid transparent;
    border-right: 6px solid transparent; border-top: 8px solid ${color};
  "></div></div>`,
    iconSize: [42, 50],
    iconAnchor: [21, 50],
    popupAnchor: [0, -50],
});

const airportIcon = createIcon('#6366f1', '✈️');
const destinationIcon = createIcon('#06d6a0', '📍');

// ── Map helpers ───────────────────────────────
function MapClickHandler({ onMapClick }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
}

function FlyToLocation({ target, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo([target.lat, target.lng], zoom || 13, { duration: 1.2 });
        }
    }, [target, map, zoom]);
    return null;
}

// ── Component ─────────────────────────────────
export default function RideRequestForm() {
    const navigate = useNavigate();
    const { user, isLoggedIn, logout } = useAuth();

    // API-driven data
    const [airports, setAirports] = useState([]);
    const [popularDests, setPopularDests] = useState([]);
    const [airportsLoading, setAirportsLoading] = useState(true);

    const [selectedAirport, setSelectedAirport] = useState(null);
    const [showAirportPicker, setShowAirportPicker] = useState(false);
    const [destination, setDestination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [luggageCount, setLuggageCount] = useState(1);
    const [maxDetourRatio, setMaxDetourRatio] = useState(1.4);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fareEstimate, setFareEstimate] = useState(null);
    const [estimateLoading, setEstimateLoading] = useState(false);
    const [panelExpanded, setPanelExpanded] = useState(true);
    const [flyTarget, setFlyTarget] = useState(null);
    const [direction, setDirection] = useState('FROM_AIRPORT'); // FROM_AIRPORT or TO_AIRPORT

    // Auth guard
    useEffect(() => {
        if (!isLoggedIn) navigate('/login');
    }, [isLoggedIn, navigate]);

    // Fetch airports from API
    useEffect(() => {
        setAirportsLoading(true);
        getAirports()
            .then((data) => {
                const list = data.airports || [];
                setAirports(list);
                if (list.length > 0) setSelectedAirport(list[0]);
            })
            .catch(() => setAirports([]))
            .finally(() => setAirportsLoading(false));
    }, []);

    // Fetch destinations when airport changes
    useEffect(() => {
        if (!selectedAirport) return;
        getDestinations(selectedAirport.id)
            .then((data) => setPopularDests(data.destinations || []))
            .catch(() => setPopularDests([]));
    }, [selectedAirport]);

    const filteredDestinations = popularDests.filter((d) =>
        d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fare estimate
    useEffect(() => {
        if (destination && selectedAirport) {
            setEstimateLoading(true);
            const timer = setTimeout(() => {
                getFareEstimate(destination.lat, destination.lng, true, selectedAirport.lat, selectedAirport.lng)
                    .then((data) => setFareEstimate(data))
                    .catch(() => setFareEstimate(null))
                    .finally(() => setEstimateLoading(false));
            }, 400);
            return () => clearTimeout(timer);
        } else {
            setFareEstimate(null);
        }
    }, [destination, selectedAirport]);

    const handleAirportChange = (airport) => {
        setSelectedAirport(airport);
        setShowAirportPicker(false);
        setDestination(null);
        setSearchQuery('');
        setFareEstimate(null);
        setFlyTarget({ lat: airport.lat, lng: airport.lng, _t: Date.now() });
    };

    const handleMapClick = (latlng) => {
        const dest = {
            lat: latlng.lat, lng: latlng.lng,
            address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
            fullAddress: `Custom Location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        };
        setDestination(dest);
        setShowSearch(false);
        setFlyTarget({ ...dest, _t: Date.now() });
    };

    const handleSelectDestination = (dest) => {
        setDestination(dest);
        setSearchQuery(dest.address);
        setShowSearch(false);
        setFlyTarget({ ...dest, _t: Date.now() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!destination) return setError('Please select a destination');

        setLoading(true);
        try {
            const result = await requestRide({
                passengerId: user.id,
                originLat: selectedAirport.lat,
                originLng: selectedAirport.lng,
                destLat: direction === 'FROM_AIRPORT' ? destination.lat : selectedAirport.lat,
                destLng: direction === 'FROM_AIRPORT' ? destination.lng : selectedAirport.lng,
                destAddress: direction === 'FROM_AIRPORT'
                    ? (destination.fullAddress || destination.address)
                    : `${selectedAirport.name} (${selectedAirport.code})`,
                direction,
                luggageCount,
                maxDetourRatio,
            });
            navigate(`/ride-status/${result.rideRequestId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create ride. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const routeLine = (destination && selectedAirport)
        ? [[selectedAirport.lat, selectedAirport.lng], [destination.lat, destination.lng]]
        : null;

    if (!isLoggedIn) return null;

    // Loading state while airports load
    if (airportsLoading || !selectedAirport) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-bg)', color: 'var(--color-text-dim)',
                flexDirection: 'column', gap: '0.75rem',
            }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.9rem' }}>Loading airports...</span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            {/* ── Map ────────────────────────────────── */}
            <MapContainer
                center={[selectedAirport.lat, selectedAirport.lng]}
                zoom={12}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                <FlyToLocation target={flyTarget} zoom={destination ? 13 : 11} />

                <Marker position={[selectedAirport.lat, selectedAirport.lng]} icon={airportIcon}>
                    <Popup>
                        <div style={{ textAlign: 'center', fontWeight: 600 }}>
                            ✈️ {selectedAirport.name}<br />
                            <span style={{ fontSize: '0.8em', color: '#666' }}>Pickup Point</span>
                        </div>
                    </Popup>
                </Marker>

                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center', fontWeight: 600 }}>
                                📍 {destination.address}<br />
                                <span style={{ fontSize: '0.8em', color: '#666' }}>{direction === 'FROM_AIRPORT' ? 'Drop-off' : 'Pickup'}</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {routeLine && (
                    <Polyline
                        positions={routeLine}
                        pathOptions={{ color: '#6366f1', weight: 3, dashArray: '10, 8', opacity: 0.8 }}
                    />
                )}
            </MapContainer>

            {/* ── Top Bar ────────────────────────────── */}
            <div style={{
                position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                width: '92%', maxWidth: '480px', zIndex: 1000,
            }}>
                <div style={{
                    background: 'rgba(10, 14, 26, 0.94)', backdropFilter: 'blur(20px)',
                    borderRadius: '18px', border: '1px solid rgba(99, 102, 241, 0.15)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)', padding: '0.75rem',
                }}>
                    {/* User bar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingBottom: '0.5rem', marginBottom: '0.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '26px', height: '26px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '0.6rem', fontWeight: 700,
                            }}>
                                {user?.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600 }}>
                                Hi, {user?.name?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                background: 'none', border: 'none', color: 'var(--color-text-dim)',
                                cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem 0.4rem', borderRadius: '6px',
                            }}
                        >
                            <LogOut size={11} /> Logout
                        </button>
                    </div>

                    {/* FROM — Airport Selector */}
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => { setShowAirportPicker(!showAirportPicker); setShowSearch(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                                padding: '0.45rem 0.5rem', background: 'transparent', border: 'none',
                                cursor: 'pointer', textAlign: 'left', borderRadius: '8px', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: '#6366f1', border: '2px solid rgba(99, 102, 241, 0.3)', flexShrink: 0,
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{direction === 'FROM_AIRPORT' ? 'FROM' : 'TO'}</div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', fontWeight: 500 }}>
                                    ✈️ {selectedAirport.city} ({selectedAirport.code})
                                </div>
                            </div>
                            <ChevronDown size={14} style={{ color: 'var(--color-text-dim)', transition: 'transform 0.2s', transform: showAirportPicker ? 'rotate(180deg)' : '' }} />
                        </button>

                        {showAirportPicker && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem',
                                background: 'rgba(10, 14, 26, 0.97)', borderRadius: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                                padding: '0.35rem', zIndex: 10, maxHeight: '220px', overflowY: 'auto',
                            }}>
                                {airports.map((ap) => (
                                    <button
                                        key={ap.id}
                                        onClick={() => handleAirportChange(ap)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                                            width: '100%', padding: '0.5rem 0.6rem',
                                            background: selectedAirport.id === ap.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            textAlign: 'left', color: 'var(--color-text)', transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.07)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = selectedAirport.id === ap.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: selectedAirport.id === ap.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0,
                                        }}>✈️</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                                                {ap.city}
                                                <span style={{ color: 'var(--color-text-dim)', fontWeight: 500, marginLeft: '0.35rem' }}>({ap.code})</span>
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ap.name}
                                            </div>
                                        </div>
                                        {selectedAirport.id === ap.id && (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06d6a0', flexShrink: 0 }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Direction Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.15rem 0' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setDirection(d => d === 'FROM_AIRPORT' ? 'TO_AIRPORT' : 'FROM_AIRPORT');
                                setDestination(null);
                                setSearchQuery('');
                                setFareEstimate(null);
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.3rem 0.7rem', borderRadius: '20px',
                                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                color: '#818cf8', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.18)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
                            title="Swap direction"
                        >
                            <ArrowDownUp size={12} />
                            {direction === 'FROM_AIRPORT' ? 'Airport → Location' : 'Location → Airport'}
                        </button>
                    </div>

                    {/* TO — Destination Search */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.45rem 0.5rem', background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#06d6a0', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{direction === 'FROM_AIRPORT' ? 'TO' : 'FROM'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <input
                                    type="text"
                                    placeholder={direction === 'FROM_AIRPORT' ? 'Where are you going?' : 'Where are you coming from?'}
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); setShowAirportPicker(false); }}
                                    onFocus={() => { setShowSearch(true); setShowAirportPicker(false); }}
                                    style={{
                                        width: '100%', padding: '0.15rem 0', background: 'transparent',
                                        border: 'none', color: 'var(--color-text)', fontSize: '0.88rem',
                                        fontWeight: 500, outline: 'none',
                                    }}
                                />
                                {destination && (
                                    <button
                                        onClick={() => { setDestination(null); setSearchQuery(''); setFareEstimate(null); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', display: 'flex', padding: '2px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Destination Dropdown */}
                {showSearch && !showAirportPicker && (
                    <div style={{
                        marginTop: '0.5rem', background: 'rgba(10, 14, 26, 0.96)',
                        backdropFilter: 'blur(20px)', borderRadius: '16px',
                        border: '1px solid rgba(99, 102, 241, 0.12)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                        maxHeight: '260px', overflowY: 'auto', padding: '0.4rem',
                    }}>
                        <div style={{
                            padding: '0.3rem 0.7rem', fontSize: '0.62rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-dim)',
                        }}>
                            {searchQuery ? 'Results' : `Popular in ${selectedAirport.city}`}
                        </div>
                        {filteredDestinations.length === 0 && (
                            <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
                                No matching destinations. Try tapping the map.
                            </div>
                        )}
                        {filteredDestinations.map((dest) => (
                            <button
                                key={dest.fullAddress}
                                onClick={() => handleSelectDestination(dest)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    width: '100%', padding: '0.5rem 0.6rem',
                                    background: destination?.fullAddress === dest.fullAddress ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                                    transition: 'background 0.15s', textAlign: 'left', color: 'var(--color-text)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.07)'}
                                onMouseLeave={(e) => e.currentTarget.style.background =
                                    destination?.fullAddress === dest.fullAddress ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
                            >
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    background: 'rgba(6, 214, 160, 0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#06d6a0', flexShrink: 0,
                                }}>
                                    <MapPin size={13} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{dest.address}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)' }}>{dest.fullAddress}</div>
                                </div>
                            </button>
                        ))}
                        <div style={{
                            padding: '0.45rem 0.7rem', fontSize: '0.68rem',
                            color: 'var(--color-text-dim)', borderTop: '1px solid rgba(255,255,255,0.04)',
                            marginTop: '0.1rem', textAlign: 'center',
                        }}>
                            💡 Tap the map for a custom destination
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Panel ───────────────────────── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
                background: 'rgba(10, 14, 26, 0.96)', backdropFilter: 'blur(24px)',
                borderRadius: '24px 24px 0 0',
                border: '1px solid rgba(99, 102, 241, 0.12)', borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5)',
                transition: 'max-height 0.3s ease',
                maxHeight: panelExpanded ? '400px' : '130px', overflow: 'hidden',
            }}>
                <button
                    onClick={() => setPanelExpanded(!panelExpanded)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', padding: '0.6rem', background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--color-text-dim)',
                    }}
                >
                    <div style={{ width: '32px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
                </button>

                <form onSubmit={handleSubmit} style={{ padding: '0 1.25rem 1.25rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.5rem 0.7rem', background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px',
                            color: '#f87171', fontSize: '0.8rem', marginBottom: '0.7rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            {error}
                            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {destination ? (
                        <div style={{
                            display: 'flex', gap: '0.7rem', alignItems: 'center',
                            marginBottom: '0.8rem', padding: '0.65rem',
                            background: 'rgba(99, 102, 241, 0.05)', borderRadius: '14px',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '12px',
                                background: '#06d6a010', border: '1px solid #06d6a020',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#06d6a0', flexShrink: 0,
                            }}>
                                <Navigation size={15} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {destination.address}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                                    {fareEstimate ? `${fareEstimate.distanceKm?.toFixed(1) || '—'} km • ${Math.round((fareEstimate.distanceKm || 12) * 2.5)} min` : 'Calculating...'}
                                </div>
                            </div>
                            {estimateLoading ? (
                                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                            ) : fareEstimate ? (
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06d6a0' }}>
                                        ₹{fareEstimate.pooledFare || fareEstimate.estimatedFare || '—'}
                                    </div>
                                    <div style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', fontWeight: 500 }}>pooled fare</div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '0.6rem',
                            color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: '0.6rem',
                        }}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                            Search or tap the map to set destination
                        </div>
                    )}

                    {panelExpanded && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                <div>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-dim)', marginBottom: '0.25rem',
                                    }}>
                                        <Luggage size={11} /> Luggage: {luggageCount}
                                    </label>
                                    <input type="range" min="0" max="5" value={luggageCount}
                                        onChange={(e) => setLuggageCount(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#6366f1' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--color-text-dim)' }}>
                                        <span>None</span><span>5</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-dim)', marginBottom: '0.25rem',
                                    }}>
                                        <SlidersHorizontal size={11} /> Detour: {maxDetourRatio.toFixed(1)}x
                                    </label>
                                    <input type="range" min="1.0" max="2.5" step="0.1" value={maxDetourRatio}
                                        onChange={(e) => setMaxDetourRatio(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#6366f1' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--color-text-dim)' }}>
                                        <span>Direct</span><span>Flexible</span>
                                    </div>
                                </div>
                            </div>

                            {fareEstimate && (
                                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.8rem' }}>
                                    <div style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', background: 'rgba(6, 214, 160, 0.06)', border: '1px solid rgba(6, 214, 160, 0.15)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>POOLED</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#06d6a0' }}>₹{fareEstimate.pooledFare || fareEstimate.estimatedFare || '—'}</div>
                                    </div>
                                    <div style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>SOLO</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>₹{fareEstimate.soloFare || fareEstimate.baseFare || '—'}</div>
                                    </div>
                                    <div style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>DISTANCE</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{fareEstimate.distanceKm?.toFixed(1) || '—'} km</div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit" className="btn-primary"
                        disabled={loading || !destination}
                        style={{
                            width: '100%', justifyContent: 'center', padding: '0.8rem',
                            fontSize: '0.92rem', borderRadius: '14px', fontWeight: 700,
                            opacity: (loading || !destination) ? 0.5 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                Finding your pool...
                            </>
                        ) : (
                            <>
                                <Plane size={15} />
                                {destination ? 'Request Pooled Ride' : 'Select a Destination'}
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .leaflet-container { background: #0a0e1a !important; font-family: 'Inter', sans-serif; }
        .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95); color: white;
          border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .leaflet-popup-tip { background: rgba(17, 24, 39, 0.95); }
        .leaflet-control-attribution { background: rgba(10, 14, 26, 0.8) !important; color: #64748b !important; font-size: 0.6rem !important; }
        .leaflet-control-attribution a { color: #818cf8 !important; }
      `}</style>
        </div>
    );
}
