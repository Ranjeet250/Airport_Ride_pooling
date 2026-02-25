// ─────────────────────────────────────────────
// Data Controller — Airports & Destinations
// Serves location data via API (no hardcoding)
// ─────────────────────────────────────────────

const AIRPORTS = [
    { id: 'maa', code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', lat: 12.9941, lng: 80.1709 },
    { id: 'del', code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
    { id: 'bom', code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Airport', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
    { id: 'blr', code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', lat: 13.1986, lng: 77.7066 },
    { id: 'hyd', code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', lat: 17.2403, lng: 78.4294 },
    { id: 'ccu', code: 'CCU', name: 'Netaji Subhas Chandra Bose Airport', city: 'Kolkata', lat: 22.6520, lng: 88.4463 },
];

const DESTINATIONS = {
    maa: [
        { address: 'T. Nagar', fullAddress: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
        { address: 'Anna Nagar', fullAddress: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101 },
        { address: 'Velachery', fullAddress: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180 },
        { address: 'Adyar', fullAddress: 'Adyar, Chennai', lat: 13.0063, lng: 80.2574 },
        { address: 'Mylapore', fullAddress: 'Mylapore, Chennai', lat: 13.0368, lng: 80.2676 },
        { address: 'Guindy', fullAddress: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206 },
        { address: 'Tambaram', fullAddress: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000 },
        { address: 'OMR Thoraipakkam', fullAddress: 'Thoraipakkam, OMR', lat: 12.9300, lng: 80.2287 },
    ],
    del: [
        { address: 'Connaught Place', fullAddress: 'CP, New Delhi', lat: 28.6315, lng: 77.2167 },
        { address: 'Dwarka', fullAddress: 'Dwarka, Delhi', lat: 28.5921, lng: 77.0460 },
        { address: 'Gurugram', fullAddress: 'Gurugram, Haryana', lat: 28.4595, lng: 77.0266 },
        { address: 'Noida Sec 18', fullAddress: 'Sector 18, Noida', lat: 28.5706, lng: 77.3219 },
        { address: 'Karol Bagh', fullAddress: 'Karol Bagh, Delhi', lat: 28.6519, lng: 77.1909 },
        { address: 'Saket', fullAddress: 'Saket, New Delhi', lat: 28.5244, lng: 77.2066 },
        { address: 'Vasant Kunj', fullAddress: 'Vasant Kunj, Delhi', lat: 28.5200, lng: 77.1540 },
        { address: 'Hauz Khas', fullAddress: 'Hauz Khas, Delhi', lat: 28.5494, lng: 77.2001 },
    ],
    bom: [
        { address: 'Bandra', fullAddress: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
        { address: 'Andheri', fullAddress: 'Andheri, Mumbai', lat: 19.1197, lng: 72.8464 },
        { address: 'Colaba', fullAddress: 'Colaba, Mumbai', lat: 18.9067, lng: 72.8147 },
        { address: 'Powai', fullAddress: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060 },
        { address: 'Juhu', fullAddress: 'Juhu, Mumbai', lat: 19.0883, lng: 72.8264 },
        { address: 'Thane', fullAddress: 'Thane, Maharashtra', lat: 19.2183, lng: 72.9781 },
        { address: 'Navi Mumbai', fullAddress: 'Vashi, Navi Mumbai', lat: 19.0771, lng: 72.9986 },
        { address: 'Worli', fullAddress: 'Worli, Mumbai', lat: 19.0176, lng: 72.8150 },
    ],
    blr: [
        { address: 'MG Road', fullAddress: 'MG Road, Bangalore', lat: 12.9716, lng: 77.6194 },
        { address: 'Whitefield', fullAddress: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
        { address: 'Koramangala', fullAddress: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
        { address: 'Electronic City', fullAddress: 'Electronic City, Bangalore', lat: 12.8399, lng: 77.6809 },
        { address: 'Indiranagar', fullAddress: 'Indiranagar, Bangalore', lat: 12.9716, lng: 77.6412 },
        { address: 'HSR Layout', fullAddress: 'HSR Layout, Bangalore', lat: 12.9116, lng: 77.6389 },
        { address: 'Jayanagar', fullAddress: 'Jayanagar, Bangalore', lat: 12.9308, lng: 77.5838 },
        { address: 'Hebbal', fullAddress: 'Hebbal, Bangalore', lat: 13.0358, lng: 77.5970 },
    ],
    hyd: [
        { address: 'Hitech City', fullAddress: 'Hitech City, Hyderabad', lat: 17.4435, lng: 78.3772 },
        { address: 'Banjara Hills', fullAddress: 'Banjara Hills, Hyderabad', lat: 17.4107, lng: 78.4439 },
        { address: 'Gachibowli', fullAddress: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3489 },
        { address: 'Secunderabad', fullAddress: 'Secunderabad, Hyderabad', lat: 17.4399, lng: 78.4983 },
        { address: 'Jubilee Hills', fullAddress: 'Jubilee Hills, Hyderabad', lat: 17.4325, lng: 78.4073 },
        { address: 'Madhapur', fullAddress: 'Madhapur, Hyderabad', lat: 17.4484, lng: 78.3908 },
        { address: 'Kukatpally', fullAddress: 'Kukatpally, Hyderabad', lat: 17.4948, lng: 78.3996 },
        { address: 'Charminar', fullAddress: 'Charminar, Hyderabad', lat: 17.3616, lng: 78.4747 },
    ],
    ccu: [
        { address: 'Park Street', fullAddress: 'Park Street, Kolkata', lat: 22.5551, lng: 88.3528 },
        { address: 'Salt Lake', fullAddress: 'Salt Lake City, Kolkata', lat: 22.5809, lng: 88.4170 },
        { address: 'Howrah', fullAddress: 'Howrah, Kolkata', lat: 22.5958, lng: 88.2636 },
        { address: 'New Town', fullAddress: 'New Town, Kolkata', lat: 22.5935, lng: 88.4847 },
        { address: 'Esplanade', fullAddress: 'Esplanade, Kolkata', lat: 22.5645, lng: 88.3527 },
        { address: 'Ballygunge', fullAddress: 'Ballygunge, Kolkata', lat: 22.5270, lng: 88.3651 },
        { address: 'Gariahat', fullAddress: 'Gariahat, Kolkata', lat: 22.5189, lng: 88.3680 },
        { address: 'Rajarhat', fullAddress: 'Rajarhat, Kolkata', lat: 22.6063, lng: 88.4500 },
    ],
};

/**
 * GET /data/airports
 */
exports.getAirports = (req, res) => {
    res.json({ airports: AIRPORTS });
};

/**
 * GET /data/destinations/:airportId
 */
exports.getDestinations = (req, res) => {
    const { airportId } = req.params;
    const destinations = DESTINATIONS[airportId];

    if (!destinations) {
        return res.status(404).json({
            error: `No destinations found for airport: ${airportId}`,
            availableAirports: AIRPORTS.map((a) => a.id),
        });
    }

    res.json({ airportId, destinations });
};

/**
 * GET /data/destinations
 * Returns all destinations grouped by airport
 */
exports.getAllDestinations = (req, res) => {
    res.json({ destinations: DESTINATIONS });
};
