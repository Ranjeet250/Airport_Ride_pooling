import PoolDetails from '../components/dashboard/PoolDetails';

export default function PoolDetailsPage() {
    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh' }}>
            <div className="section" style={{ paddingTop: '2rem' }}>
                <PoolDetails />
            </div>
        </div>
    );
}
