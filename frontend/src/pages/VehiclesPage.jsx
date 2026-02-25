import { Car } from 'lucide-react';
import VehicleList from '../components/dashboard/VehicleList';

export default function VehiclesPage() {
    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh' }}>
            <div className="section" style={{ paddingTop: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: '0.85rem',
                        color: 'var(--color-primary-light)',
                        fontWeight: 500,
                        marginBottom: '1rem',
                    }}>
                        <Car size={14} />
                        Fleet Status
                    </div>
                    <h1 className="section-title">
                        Available <span className="gradient-text">Vehicles</span>
                    </h1>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Vehicles waiting at Chennai Airport ready for your ride
                    </p>
                </div>

                <VehicleList />
            </div>
        </div>
    );
}
