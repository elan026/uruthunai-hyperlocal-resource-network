import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet Default Icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom icons based on categories
const createIcon = (colorHex) => {
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${colorHex}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const categoryConfig = [
    { key: 'Medical Help', label: 'Medical Help', color: 'bg-red-500', hex: '#ef4444', icon: 'medical_services', textColor: 'text-red-500' },
    { key: 'Shelter', label: 'Shelter', color: 'bg-blue-500', hex: '#3b82f6', icon: 'home_work', textColor: 'text-blue-500' },
    { key: 'Water & Food', label: 'Water & Food', color: 'bg-green-500', hex: '#22c55e', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Electricity / Generator', label: 'Electricity/Gen', color: 'bg-yellow-500', hex: '#eab308', icon: 'electric_bolt', textColor: 'text-yellow-500' },
    { key: 'Transport', label: 'Transport', color: 'bg-purple-500', hex: '#a855f7', icon: 'local_shipping', textColor: 'text-purple-500' },
    { key: 'Volunteers', label: 'Volunteers', color: 'bg-orange-500', hex: '#f97316', icon: 'group', textColor: 'text-orange-500' },
];

function SetMapCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true });
        }
    }, [center, map]);
    return null;
}

export default function ResourceMap() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [filters, setFilters] = useState(categoryConfig.map(c => c.key));
    const [userLocation, setUserLocation] = useState(null);
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    const [mapRef, setMapRef] = useState(null);

    // Summary data for Activity Layer
    const activitySummary = useMemo(() => {
        const offers = listings.filter(l => l.type === 'offer').length;
        const requests = listings.filter(l => l.type === 'request').length;
        return { offers, requests, total: offers + requests };
    }, [listings]);

    useEffect(() => {
        // 1. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);
                    fetchNearby(lat, lng);
                },
                (error) => {
                    console.error("Error getting location", error);
                    // Default to Chennai if denied
                    const defaultLat = 13.0827;
                    const defaultLng = 80.2707;
                    setUserLocation([defaultLat, defaultLng]);
                    fetchNearby(defaultLat, defaultLng);
                }
            );
        } else {
            const defaultLat = 13.0827;
            const defaultLng = 80.2707;
            setUserLocation([defaultLat, defaultLng]);
            fetchNearby(defaultLat, defaultLng);
        }

        // 2. Setup Socket.io for Real-time Map Updates
        const socket = io('http://localhost:5000');

        socket.on('new_listing_created', (newListing) => {
            console.log('Received new listing from socket:', newListing);
            // Append incoming feature to our list
            setListings((prevListings) => [newListing, ...prevListings]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchNearby = async (lat, lng) => {
        try {
            const res = await listingService.getNearby(lat, lng, 5); // 5km radius
            if (res.data.success) {
                setListings(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching listings', err);
        }
    };

    const toggleFilter = (key) => {
        setFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
    };

    const filteredListings = listings.filter(l => filters.includes(l.category));

    const getCategoryStyle = (category) => {
        return categoryConfig.find(c => c.key === category) || categoryConfig[0];
    };

    return (
        <div className="flex-1 flex overflow-hidden relative h-full w-full bg-slate-100">
            {/* Map Backend Layer */}
            <div className="absolute inset-0 z-0">
                {userLocation ? (
                    <MapContainer
                        center={userLocation}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        ref={setMapRef}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        />

                        <SetMapCenter center={userLocation} />

                        {/* User Location Marker */}
                        <Marker position={userLocation} icon={createIcon('#334155')}>
                            <Popup>
                                <span className="font-bold">You are here</span>
                            </Popup>
                        </Marker>

                        {/* List Features with Clustering */}
                        <MarkerClusterGroup chunkedLoading>
                            {filteredListings.map(listing => {
                                let markerColor = getCategoryStyle(listing.category).hex;

                                if (isEmergencyMode) {
                                    if (listing.category === 'Medical Help') markerColor = '#ef4444';
                                    else if (listing.urgency_level === 'Critical' || listing.is_emergency) markerColor = '#ef4444';
                                    else if (listing.type === 'request') markerColor = '#f97316';
                                    else markerColor = '#22c55e';
                                }

                                return (
                                    <Marker
                                        key={`${listing.type}-${listing.id}`}
                                        position={[listing.location_lat, listing.location_lng]}
                                        icon={createIcon(markerColor)}
                                    >
                                        <Popup>
                                            <div className="min-w-[200px] p-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm`} style={{ backgroundColor: markerColor }}>
                                                        {listing.type === 'offer' ? 'Offer' : 'Need'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">{listing.category}</span>
                                                </div>
                                                <h3 className="font-bold text-sm mb-1 line-clamp-2">{listing.title_or_description}</h3>
                                                <div className="text-[10px] text-slate-500 mb-3 flex justify-between items-center">
                                                    <span>~{listing.distance} away</span>
                                                    <span>{listing.user_name}</span>
                                                </div>
                                                <button
                                                    className="w-full py-2 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors"
                                                    onClick={() => navigate(listing.type === 'offer' ? `/resource/${listing.id}` : '#')}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MarkerClusterGroup>
                    </MapContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="text-sm font-medium text-slate-500 text-animate-pulse">Acquiring live map data...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Left Panel - Intelligence & Filters */}
            <div className="relative z-[400] w-[340px] m-4 flex flex-col gap-4 pointer-events-none h-[calc(100vh-8rem)]">

                {/* Header & Emergency Mode */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/40 pointer-events-auto shrink-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">explore</span>
                            Map Radar
                        </h2>
                        <button
                            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                            className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${isEmergencyMode ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                            title="Disaster Mode overrides colors to highlight medical emergencies in Red."
                        >
                            <span className="material-symbols-outlined text-[18px]">{isEmergencyMode ? 'warning' : 'health_and_safety'}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{isEmergencyMode ? 'Disaster' : 'Normal'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-800 leading-none">{activitySummary.requests}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Live Needs</span>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-2 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-primary leading-none">{activitySummary.offers}</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">Live Offers</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/40 pointer-events-auto shrink-0 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Filters</h3>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{filters.length} Selected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categoryConfig.map(cat => {
                            const isActive = filters.includes(cat.key);
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => toggleFilter(cat.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${isActive ? 'bg-slate-800 text-white border-slate-800 shadow-md transform hover:scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                >
                                    {isActive && <span className={`size-2 rounded-full ${cat.color}`}></span>}
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feed / List View */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 pointer-events-auto flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                        <h3 className="text-sm font-bold text-slate-800">Nearby ({filteredListings.length})</h3>
                        <button onClick={() => { if (mapRef && userLocation) mapRef.flyTo(userLocation, 14); }} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">my_location</span> Recenter
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {filteredListings.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">location_off</span>
                                <p className="text-xs font-medium text-slate-400">No resources found for the selected filters in your radius.</p>
                            </div>
                        ) : (
                            filteredListings.map(listing => {
                                const style = getCategoryStyle(listing.category);
                                const isOffer = listing.type === 'offer';
                                return (
                                    <div
                                        key={`${listing.type}-${listing.id}`}
                                        className="bg-white border text-left border-slate-100 rounded-xl p-3 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md group flex flex-col gap-2 relative overflow-hidden"
                                        onClick={() => {
                                            if (mapRef) {
                                                mapRef.flyTo([listing.location_lat, listing.location_lng], 16, { animate: true });
                                            }
                                        }}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.color}`}></div>
                                        <div className="flex items-start justify-between pl-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${isOffer ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
                                                    {isOffer ? 'OFFER' : 'NEED'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">{listing.distance}</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 leading-tight pl-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {listing.title_or_description}
                                        </h4>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Privacy Badge */}
                <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-3 pointer-events-auto shrink-0 shadow-lg border border-slate-700 mx-auto w-max flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-[16px]">lock</span>
                    <span className="text-[10px] font-medium text-slate-300">Location boundaries obfuscated.</span>
                </div>
            </div>

        </div>
    );
}
