import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Ride APIs ────────────────────────────────
export const requestRide = (data) =>
    api.post('/ride/request', data).then((r) => r.data);

export const cancelRide = (rideRequestId) =>
    api.post('/ride/cancel', { rideRequestId }).then((r) => r.data);

export const getRideStatus = (id) =>
    api.get(`/ride/status/${id}`).then((r) => r.data);

export const getPoolDetails = (id) =>
    api.get(`/ride/pool/${id}`).then((r) => r.data);

// ─── Vehicle APIs ─────────────────────────────
export const getAvailableVehicles = (limit = 20, offset = 0) =>
    api.get('/vehicle/available', { params: { limit, offset } }).then((r) => r.data);

// ─── Pricing APIs ─────────────────────────────
export const getFareEstimate = (destLat, destLng, isPooled = true, originLat = null, originLng = null) => {
    const params = { destLat, destLng, isPooled };
    if (originLat !== null && originLng !== null) {
        params.originLat = originLat;
        params.originLng = originLng;
    }
    return api.get('/pricing/estimate', { params }).then((r) => r.data);
};

// ─── Passenger / Auth APIs ────────────────────
export const loginPassenger = (email) =>
    api.post('/passenger/login', { email }).then((r) => r.data);

export const registerPassenger = (name, email, phone) =>
    api.post('/passenger/register', { name, email, phone }).then((r) => r.data);

export const getAllPassengers = () =>
    api.get('/passenger/all').then((r) => r.data);

// ─── Data APIs (Airports & Destinations) ──────
export const getAirports = () =>
    api.get('/data/airports').then((r) => r.data);

export const getDestinations = (airportId) =>
    api.get(`/data/destinations/${airportId}`).then((r) => r.data);

// ─── Health APIs ──────────────────────────────
export const getHealth = () =>
    api.get('/health').then((r) => r.data);

export const getQueueHealth = () =>
    api.get('/queue/health').then((r) => r.data);

export default api;
