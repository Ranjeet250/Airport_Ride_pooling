import RideStatusTracker from '../components/booking/RideStatusTracker';

export default function RideStatusPage() {
    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh' }}>
            <div className="section" style={{ paddingTop: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="section-title">
                        Ride <span className="gradient-text">Status</span>
                    </h1>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Tracking your ride request in real-time
                    </p>
                </div>

                <RideStatusTracker />
            </div>
        </div>
    );
}
