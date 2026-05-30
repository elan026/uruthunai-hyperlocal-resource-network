import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listingService, requestService } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// ─── Utility: Haversine Distance (km) ───
const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
};

// ─── Utility: Relative Time ───
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// Fix Leaflet Default Icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Custom Map Icons (Issue #1: increased to 36px base for WCAG touch targets) ───
const createIcon = (colorHex, isNew = false, isDangerMode = false, isExhausted = false, isSelected = false) => {
    const size = isSelected ? 44 : (isNew ? 40 : 36);

    const selectedRing = isSelected
        ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${size + 20}px;height:${size + 20}px;border-radius:50%;border:3px solid ${colorHex};animation:pulse-ring 1.5s ease-out infinite"></div>`
        : '';

    const pulseRing = isNew && !isExhausted && !isSelected
        ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${size + 16}px;height:${size + 16}px;border-radius:50%;background:${colorHex}33;animation:pulse-ring 1.5s ease-out infinite"></div>`
        : '';

    const innerShape = isDangerMode
        ? `<svg width="${size + 8}" height="${size + 8}" viewBox="0 0 24 24" fill="${colorHex}" stroke="white" stroke-width="2" style="filter: drop-shadow(0px 0px 4px ${colorHex}80);${isNew ? 'animation:marker-bounce 0.6s ease-out' : ''}"><path d="M12 2L22 20H2L12 2Z" /></svg>`
        : `<div style="background-color: ${colorHex}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${colorHex}80;${isNew ? 'animation:marker-bounce 0.6s ease-out' : ''}"></div>`;

    const exhaustedStyle = isExhausted ? 'filter: grayscale(1) opacity(0.6);' : '';

    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="position:relative;display:flex;justify-content:center;align-items:center;${exhaustedStyle}">${selectedRing}${pulseRing}${innerShape}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const categoryConfig = [
    { key: 'Medical Help', label: 'Medical Help', color: 'bg-red-500', hex: '#ef4444', icon: 'medical_services', textColor: 'text-red-500' },
    { key: 'Medical Supplies', label: 'Medical Supplies', color: 'bg-red-500', hex: '#ef4444', icon: 'medical_services', textColor: 'text-red-500' },
    { key: 'Medical / First Aid', label: 'Medical', color: 'bg-red-500', hex: '#ef4444', icon: 'medical_services', textColor: 'text-red-500' },
    { key: 'Shelter', label: 'Shelter', color: 'bg-blue-500', hex: '#3b82f6', icon: 'home_work', textColor: 'text-blue-500' },
    { key: 'Emergency Shelter', label: 'Shelter', color: 'bg-blue-500', hex: '#3b82f6', icon: 'home_work', textColor: 'text-blue-500' },
    { key: 'Temporary Shelter', label: 'Shelter', color: 'bg-blue-500', hex: '#3b82f6', icon: 'home_work', textColor: 'text-blue-500' },
    { key: 'Water & Food', label: 'Water & Food', color: 'bg-green-500', hex: '#22c55e', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Food & Water', label: 'Food & Water', color: 'bg-green-500', hex: '#22c55e', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Food & Rations', label: 'Food', color: 'bg-green-500', hex: '#22c55e', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Drinking Water', label: 'Water', color: 'bg-green-500', hex: '#22c55e', icon: 'water_drop', textColor: 'text-green-500' },
    { key: 'Electricity / Generator', label: 'Power', color: 'bg-yellow-500', hex: '#eab308', icon: 'electric_bolt', textColor: 'text-yellow-500' },
    { key: 'Power / Charging', label: 'Power', color: 'bg-yellow-500', hex: '#eab308', icon: 'electric_bolt', textColor: 'text-yellow-500' },
    { key: 'Transport', label: 'Transport', color: 'bg-purple-500', hex: '#a855f7', icon: 'local_shipping', textColor: 'text-purple-500' },
    { key: 'Rescue / Transport', label: 'Rescue', color: 'bg-purple-500', hex: '#a855f7', icon: 'local_shipping', textColor: 'text-purple-500' },
    { key: 'Rescue Tools', label: 'Rescue', color: 'bg-purple-500', hex: '#a855f7', icon: 'local_shipping', textColor: 'text-purple-500' },
    { key: 'Fuel Bank', label: 'Fuel Bank', color: 'bg-violet-500', hex: '#8b5cf6', icon: 'local_gas_station', textColor: 'text-violet-500' },
    { key: 'Gas / Fuel', label: 'Fuel Bank', color: 'bg-violet-500', hex: '#8b5cf6', icon: 'local_gas_station', textColor: 'text-violet-500' },
    { key: 'Gas Station', label: 'Gas Station', color: 'bg-amber-800', hex: '#92400e', icon: 'propane_tank', textColor: 'text-amber-800' },
    { key: 'Volunteers', label: 'Volunteers', color: 'bg-orange-500', hex: '#f97316', icon: 'group', textColor: 'text-orange-500' },
    { key: 'Clothing & Bedding', label: 'Clothing', color: 'bg-orange-500', hex: '#f97316', icon: 'checkroom', textColor: 'text-orange-500' },
    { key: 'Other', label: 'Other', color: 'bg-slate-500', hex: '#64748b', icon: 'category', textColor: 'text-slate-500' },
];

// Unique filter keys (deduplicated)
const filterCategories = [
    { key: 'Medical', label: 'Medical', color: 'bg-red-500', hex: '#ef4444' },
    { key: 'Shelter', label: 'Shelter', color: 'bg-blue-500', hex: '#3b82f6' },
    { key: 'Food & Water', label: 'Food & Water', color: 'bg-green-500', hex: '#22c55e' },
    { key: 'Power', label: 'Power', color: 'bg-yellow-500', hex: '#eab308' },
    { key: 'Transport', label: 'Transport', color: 'bg-purple-500', hex: '#a855f7' },
    { key: 'Fuel Bank', label: 'Fuel Bank', color: 'bg-violet-500', hex: '#8b5cf6' },
    { key: 'Gas Station', label: 'Gas Station', color: 'bg-amber-800', hex: '#92400e' },
    { key: 'Other', label: 'Other', color: 'bg-orange-500', hex: '#f97316' },
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

// Normalizes any category to a filter group key
function normalizeCategory(cat) {
    if (!cat) return 'Other';
    const lower = cat.toLowerCase();
    if (lower.includes('medical') || lower.includes('first aid')) return 'Medical';
    if (lower.includes('shelter')) return 'Shelter';
    if (lower.includes('food') || lower.includes('water') || lower.includes('ration')) return 'Food & Water';
    if (lower.includes('electric') || lower.includes('power') || lower.includes('generator') || lower.includes('charging')) return 'Power';
    if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('diesel')) return 'Fuel Bank';
    if (lower.includes('gas') || lower.includes('cylinder') || lower.includes('propane')) return 'Gas Station';
    if (lower.includes('transport') || lower.includes('rescue')) return 'Transport';
    return 'Other';
}

export default function ResourceMap() {
    const { hillStationDangerMode, user } = useAuth();
    const navigate = useNavigate();

    // ─── Original State ───
    const [listings, setListings] = useState([]);
    const [filters, setFilters] = useState(filterCategories.map(c => c.key));
    const [userLocation, setUserLocation] = useState(null);
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    const [mapRef, setMapRef] = useState(null);
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [realtimeToasts, setRealtimeToasts] = useState([]);
    const [newListingIds, setNewListingIds] = useState(new Set());
    const [acceptingId, setAcceptingId] = useState(null);

    // ─── New State (Issues #1, #2, #3, #6) ───
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [radiusKm, setRadiusKm] = useState(5);
    const [mobileListOpen, setMobileListOpen] = useState(false);

    // ─── Refs ───
    const listItemRefs = useRef({});
    const listContainerRef = useRef(null);
    const isFirstFilterRender = useRef(true);

    // ─── Computed Values ───
    const activitySummary = useMemo(() => {
        const offers = listings.filter(l => l.type === 'offer').length;
        const requests = listings.filter(l => l.type === 'request').length;
        return { offers, requests, total: offers + requests };
    }, [listings]);

    const filteredListings = useMemo(() => {
        return listings.filter(l => filters.includes(normalizeCategory(l.category)));
    }, [listings, filters]);

    // ─── Helpers ───
    const getCategoryStyle = (category) => {
        return categoryConfig.find(c => c.key === category) || { hex: '#64748b', color: 'bg-slate-500', textColor: 'text-slate-500' };
    };

    const getDistance = useCallback((listing) => {
        if (listing.distance && listing.distance !== 'Nearby') return listing.distance;
        if (!userLocation) return 'Unknown';
        const km = haversineKm(userLocation[0], userLocation[1], listing.location_lat, listing.location_lng);
        return formatDistance(km);
    }, [userLocation]);

    // ─── Callbacks ───
    const addToast = useCallback((listing) => {
        const id = Date.now();
        setRealtimeToasts(prev => [...prev.slice(-2), { ...listing, toastId: id }]);
        setTimeout(() => {
            setRealtimeToasts(prev => prev.filter(t => t.toastId !== id));
        }, 5000);
    }, []);

    const fetchNearby = async (lat, lng, radius = 5) => {
        try {
            const res = await listingService.getNearby(lat, lng, radius);
            if (res.data.success) {
                setListings(res.data.data);
            }
        } catch (err) {
            // Silenced: expected when server is unreachable during local dev
        }
    };

    // ─── Issue #2: Pin Click → Scroll List ───
    const handlePinClick = useCallback((listing) => {
        const key = `${listing.type}-${listing.id}`;
        setSelectedListingId(key);
    }, []);

    // ─── Issue #2: List Click → Fly to Pin ───
    const handleListItemClick = useCallback((listing) => {
        const key = `${listing.type}-${listing.id}`;
        setSelectedListingId(key);
        if (mapRef) {
            mapRef.flyTo([listing.location_lat, listing.location_lng], 17, { animate: true });
        }
        // On mobile, close sheet after brief delay so user sees map fly
        if (window.innerWidth < 768) {
            setTimeout(() => setMobileListOpen(false), 400);
        }
    }, [mapRef]);

    // ─── Effects ───

    // Geolocation + Socket.io (preserved)
    useEffect(() => {
        let watchId;
        let initialFetchDone = false;
        const defaultLat = 11.3410;
        const defaultLng = 77.7172;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);
                    if (!initialFetchDone) {
                        fetchNearby(lat, lng, 5);
                        initialFetchDone = true;
                    }
                },
                () => {
                    if (!initialFetchDone) {
                        setUserLocation([defaultLat, defaultLng]);
                        fetchNearby(defaultLat, defaultLng, 5);
                        initialFetchDone = true;
                    }
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        } else {
            setUserLocation([defaultLat, defaultLng]);
            fetchNearby(defaultLat, defaultLng, 5);
        }

        // Socket.io for Real-time Map Updates
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            setSocketStatus('connected');
            socket.emit('join_area', { pincode: '600001' });
        });

        socket.on('disconnect', () => setSocketStatus('disconnected'));
        socket.on('connect_error', () => setSocketStatus('error'));

        socket.on('new_request_created', (newListing) => {
            setListings((prevListings) => {
                if (prevListings.some(l => l.id === newListing.id && l.type === newListing.type)) {
                    return prevListings;
                }
                return [{ ...newListing, _isNew: true }, ...prevListings];
            });

            const uniqueKey = `${newListing.type}-${newListing.id}`;
            setNewListingIds(prev => new Set([...prev, uniqueKey]));
            setTimeout(() => {
                setNewListingIds(prev => {
                    const next = new Set(prev);
                    next.delete(uniqueKey);
                    return next;
                });
            }, 8000);

            addToast(newListing);
        });

        socket.on('request_status_update', (update) => {
            setListings(prev => prev.map(l => l.id == update.id && l.type === 'request' ? { ...l, status: update.status, assigned_to_name: update.assigned_to_name } : l));
        });

        socket.on('request_hidden', (data) => {
            setListings(prev => prev.filter(l => !(l.id == data.id && l.type === 'request')));
        });

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            socket.disconnect();
        };
    }, [addToast]);

    // Issue #6: Refetch on radius change
    useEffect(() => {
        if (userLocation) {
            fetchNearby(userLocation[0], userLocation[1], radiusKm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radiusKm]);

    // Issue #5: Fit bounds when filters change (skip initial render)
    useEffect(() => {
        if (isFirstFilterRender.current) {
            isFirstFilterRender.current = false;
            return;
        }
        if (!mapRef || filteredListings.length === 0) return;
        const bounds = L.latLngBounds(filteredListings.map(l => [l.location_lat, l.location_lng]));
        if (bounds.isValid()) {
            mapRef.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 16 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Issue #2: Scroll to selected list item when pin is clicked
    useEffect(() => {
        if (selectedListingId && listItemRefs.current[selectedListingId]) {
            listItemRefs.current[selectedListingId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedListingId]);

    const toggleFilter = (key) => {
        setFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
    };

    // ── Accept Request Handler — wires to server with role guard ──
    const handleAcceptRequest = async (listing) => {
        if (!user) { alert('Please log in to accept requests.'); return; }
        if (user.user_type === 'resident') { alert('Only volunteers can accept requests. Apply via Settings → Role Upgrade.'); return; }

        setAcceptingId(listing.id);
        try {
            const token = localStorage.getItem('token') || user.token;
            await requestService.updateState(listing.id, 'ACCEPTED', token);

            setListings(prev => prev.map(l =>
                l.id === listing.id && l.type === 'request'
                    ? { ...l, status: 'ACCEPTED', assigned_to_name: user.name }
                    : l
            ));
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to accept request. Try again.';
            alert(msg);
        } finally {
            setAcceptingId(null);
        }
    };

    // ── Complete Request Handler ──
    const handleCompleteRequest = async (listing) => {
        if (!user) return;
        
        try {
            const token = localStorage.getItem('token') || user.token;
            await requestService.updateState(listing.id, 'COMPLETED', token);

            setListings(prev => prev.map(l =>
                l.id === listing.id && l.type === 'request'
                    ? { ...l, status: 'COMPLETED' }
                    : l
            ));
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to complete request. Try again.';
            alert(msg);
        }
    };

    // ─── Shared Render Helpers ───

    const renderFilterChips = () => (
        <div className="flex flex-wrap gap-2">
            {filterCategories.map(cat => {
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
    );

    const renderListCard = (listing) => {
        const key = `${listing.type}-${listing.id}`;
        const style = getCategoryStyle(listing.category);
        const isOffer = listing.type === 'offer';
        const isNew = newListingIds.has(key);
        const isExhausted = (listing.type === 'offer' && (listing.status === 'Unavailable' || listing.is_available === 0 || listing.quantity === 0));
        const isThisSelected = selectedListingId === key;
        const distance = getDistance(listing);
        const timestamp = timeAgo(listing.created_at || listing.posted_at);

        return (
            <div
                key={key}
                ref={(el) => { if (el) listItemRefs.current[key] = el; }}
                className={`bg-white border text-left rounded-xl p-3 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md group flex flex-col gap-2 relative overflow-hidden
                    ${isNew ? 'border-green-400 ring-1 ring-green-300' : 'border-slate-100'}
                    ${isExhausted ? 'opacity-60 grayscale' : ''}
                    ${isThisSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}
                `}
                onClick={() => handleListItemClick(listing)}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isExhausted ? 'bg-slate-400' : style.color}`}></div>
                {isNew && !isExhausted && (
                    <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-green-500 text-white rounded-full animate-pulse">LIVE</span>
                    </div>
                )}
                {isExhausted && (
                    <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-slate-500 text-slate-100 rounded-full">UNAVAILABLE</span>
                    </div>
                )}
                <div className="flex items-start justify-between pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${isExhausted ? 'bg-slate-200 text-slate-500' : (isOffer ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600')}`}>
                            {isOffer ? 'OFFER' : 'NEED'}
                        </span>
                        {/* Issue #7: Always show computed distance */}
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">near_me</span>
                            {distance}
                        </span>
                        {/* Issue #7: Timestamp */}
                        {timestamp && (
                            <>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400">{timestamp}</span>
                            </>
                        )}
                    </div>
                </div>
                {/* Issue #7: Priority badge on list cards */}
                {!isOffer && listing.priority && listing.priority !== 'LOW' && (
                    <div className="pl-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                            listing.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            listing.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>{listing.priority}</span>
                    </div>
                )}
                <h4 className={`font-bold text-sm leading-tight pl-2 transition-colors line-clamp-2 ${isExhausted ? 'line-through text-slate-400 group-hover:text-slate-500' : 'text-slate-800 group-hover:text-primary'}`}>
                    {listing.title_or_description}
                </h4>
                {listing.user_name && (
                    <p className="text-[10px] text-slate-400 pl-2 font-medium">{listing.user_name}</p>
                )}
            </div>
        );
    };

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full border-2 border-dashed border-slate-100 rounded-xl m-2">
            <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 animate-spin-slow"></div>
                <span className="material-symbols-outlined text-[40px] text-slate-300">location_on</span>
            </div>
            <h4 className="font-black text-slate-800 text-lg mb-1">It's quiet here.</h4>
            <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">Be the first to add a resource or request help in your area to activate this zone.</p>
            <div className="flex flex-col gap-2 w-full">
                <button onClick={() => navigate('/post-resource')} className="w-full bg-primary/10 text-primary font-bold py-2.5 rounded-lg text-xs hover:bg-primary/20 transition-colors">Post a Resource</button>
                <button onClick={() => navigate('/request-resource')} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">Request Help</button>
            </div>
        </div>
    );

    // ─── Issue #8: Tile URL swap for emergency mode ───
    const tileUrl = isEmergencyMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    return (
        <div className="flex-1 flex overflow-hidden relative h-full w-full bg-slate-100">
            {/* Inject animation CSS */}
            <style>{`
                @keyframes pulse-ring { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(2); opacity: 0; } }
                @keyframes marker-bounce { 0% { transform: scale(0) translateY(-20px); } 60% { transform: scale(1.2) translateY(0); } 100% { transform: scale(1) translateY(0); } }
                @keyframes toast-in { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes toast-out { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
                .toast-enter { animation: toast-in 0.4s ease-out forwards; }
                @keyframes live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                .custom-div-icon { cursor: pointer !important; transition: transform 150ms ease; }
                .custom-div-icon:hover { transform: scale(1.25); z-index: 1000 !important; }
                .custom-div-icon:active { transform: scale(0.92); }
                @keyframes count-flash { 0% { transform: scale(1); } 50% { transform: scale(1.3); color: var(--color-primary, #6366f1); } 100% { transform: scale(1); } }
                .count-update { animation: count-flash 0.4s ease-out; }
                @keyframes emergency-glow { 0%,100% { box-shadow: inset 0 0 0 4px rgba(239,68,68,0.3); } 50% { box-shadow: inset 0 0 0 4px rgba(239,68,68,0.6); } }
                .emergency-ring { animation: emergency-glow 2s ease-in-out infinite; }
            `}</style>

            {/* ═══════════ MAP LAYER ═══════════ */}
            <div className={`absolute inset-0 z-0 ${isEmergencyMode ? 'emergency-ring' : ''}`}>
                {userLocation ? (
                    <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} ref={setMapRef}>
                        {/* Issue #8: Tile swap for emergency mode */}
                        <TileLayer
                            key={tileUrl}
                            url={tileUrl}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://carto.com/">CARTO</a>'
                            maxZoom={19}
                        />
                        <SetMapCenter center={userLocation} />

                        {/* User Location + Issue #6: Dynamic radius circle */}
                        <Circle center={userLocation} radius={radiusKm * 1000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.06, weight: 1, dashArray: '6 4' }} />
                        <Marker position={userLocation} icon={createIcon('#3b82f6')}>
                            <Popup><div className="text-center"><span className="font-black text-blue-600 block mb-1">Your Live Location</span><span className="text-[10px] text-slate-500">Tracking active • {radiusKm}km radius</span></div></Popup>
                        </Marker>

                        {/* Listings with Clustering */}
                        <MarkerClusterGroup chunkedLoading>
                            {filteredListings.map(listing => {
                                const key = `${listing.type}-${listing.id}`;
                                let markerColor = getCategoryStyle(listing.category).hex;
                                const isNew = newListingIds.has(key);
                                const isExhausted = (listing.type === 'offer' && (listing.status === 'Unavailable' || listing.is_available === 0 || listing.quantity === 0));
                                const isThisSelected = selectedListingId === key;

                                if (isEmergencyMode) {
                                    if (normalizeCategory(listing.category) === 'Medical') markerColor = '#ef4444';
                                    else if (listing.urgency_level === 'Critical' || listing.is_emergency) markerColor = '#ef4444';
                                    else if (listing.type === 'request') markerColor = '#f97316';
                                    else markerColor = '#22c55e';
                                }

                                if (hillStationDangerMode) {
                                    markerColor = '#ea580c';
                                }

                                return (
                                    <Marker
                                        key={key}
                                        position={[listing.location_lat, listing.location_lng]}
                                        icon={createIcon(markerColor, isNew, hillStationDangerMode, isExhausted, isThisSelected)}
                                        zIndexOffset={isThisSelected ? 1000 : 0}
                                        eventHandlers={{
                                            click: () => handlePinClick(listing),
                                            mouseover: (e) => { e.target.setZIndexOffset(800); },
                                            mouseout: (e) => { if (!isThisSelected) e.target.setZIndexOffset(0); },
                                        }}
                                    >
                                        <Popup>
                                            <div className={`min-w-[200px] p-1 ${isExhausted ? 'opacity-70 grayscale' : ''}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm" style={{ backgroundColor: markerColor }}>
                                                        {listing.type === 'offer' ? 'Offer' : 'Need'}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">{listing.category}</span>
                                                    {isNew && !isExhausted && <span className="px-1.5 py-0.5 text-[9px] font-black bg-green-500 text-white rounded-full animate-pulse">LIVE</span>}
                                                    {isExhausted && <span className="px-1.5 py-0.5 text-[9px] font-black bg-slate-500 text-white rounded-full">UNAVAILABLE</span>}
                                                </div>
                                                <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${isExhausted ? 'line-through text-slate-400' : ''}`}>{listing.title_or_description}</h3>
                                                <div className="text-[10px] text-slate-500 mb-3 flex justify-between items-center">
                                                    <span className="font-semibold">{getDistance(listing)}</span>
                                                    <span className="flex items-center gap-1">
                                                        {listing.user_name || 'Community Member'}
                                                        {(listing.verification_status === 'Approved' || listing.verification_status === 'Verified') && (
                                                            <span className="material-symbols-outlined text-emerald-500 text-[14px]" title="Verified by call/score">verified</span>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* ── OFFER ACTIONS ── */}
                                                {listing.type === 'offer' && (
                                                    <button
                                                        className="w-full py-2 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                                                        onClick={() => navigate(`/resource/${listing.id}`)}
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                        View Details
                                                    </button>
                                                )}

                                                {/* ── NEED (REQUEST) ACTIONS — server-wired accept flow ── */}
                                                {listing.type === 'request' && (
                                                    <>
                                                        {listing.priority && listing.priority !== 'LOW' && (
                                                            <div className="mb-2">
                                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                                                                    listing.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                                    listing.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>{listing.priority}</span>
                                                            </div>
                                                        )}

                                                        {(!listing.status || listing.status === 'OPEN' || listing.status === 'Open') ? (
                                                            user && user.user_type !== 'resident' ? (
                                                                <button
                                                                    className="w-full py-2 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                                                                    onClick={() => handleAcceptRequest(listing)}
                                                                    disabled={acceptingId === listing.id}
                                                                >
                                                                    {acceptingId === listing.id ? (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                                                            Accepting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[14px]">directions_run</span>
                                                                            I'm On My Way
                                                                        </>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <p className="w-full py-2 text-center text-[10px] text-slate-400 italic border-t border-slate-100">
                                                                    Only volunteers can accept requests
                                                                </p>
                                                            )
                                                        ) : listing.status === 'ACCEPTED' ? (
                                                            <div className="w-full flex justify-between items-center py-2 border-t border-slate-100 font-bold text-xs text-orange-500">
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                                    Assigned to {listing.assigned_to_name || 'Volunteer'}
                                                                </span>
                                                                {user && user.id === listing.assigned_to_user_id && (
                                                                    <button
                                                                        onClick={() => handleCompleteRequest(listing)}
                                                                        className="bg-green-500 text-white px-2 py-1 rounded shadow text-[10px] hover:bg-green-600 transition-colors uppercase tracking-wider"
                                                                    >
                                                                        Mark Complete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : listing.status === 'COMPLETED' ? (
                                                            <div className="w-full py-2 text-center border-t border-slate-100 font-bold text-xs text-green-500 flex items-center justify-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                                Completed
                                                            </div>
                                                        ) : (
                                                            <div className="w-full py-1 text-center text-[10px] text-slate-400 border-t border-slate-100 uppercase tracking-wider font-bold">
                                                                {listing.status}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Share WhatsApp Action */}
                                                <a href={`whatsapp://send?text=🚨 [URGENT] Help needed at coordinates: ${listing.location_lat}, ${listing.location_lng}. Access full details via Urudhunai app.`} className="mt-2 w-full py-1 bg-green-500 text-white rounded-lg font-bold text-xs hover:bg-green-600 transition-colors flex justify-center items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">share</span> Share
                                                </a>
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
                            <p className="text-sm font-medium text-slate-500 animate-pulse">Acquiring live map data...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ ISSUE #8: EMERGENCY MODE BANNER ═══════════ */}
            {isEmergencyMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-red-600/95 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-red-500/40 animate-pulse pointer-events-none">
                    <span className="material-symbols-outlined text-[16px]">emergency</span>
                    EMERGENCY MODE — PRIORITY TRIAGE ACTIVE
                </div>
            )}

            {/* ═══════════ TOAST NOTIFICATIONS ═══════════ */}
            <div aria-live="polite" className="fixed top-20 right-4 z-[1000] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '320px' }}>
                {realtimeToasts.map(toast => {
                    const style = getCategoryStyle(toast.category);
                    return (
                        <div
                            key={toast.toastId}
                            className="toast-enter pointer-events-auto bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-200 p-4 flex items-start gap-3 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                                if (mapRef && toast.location_lat && toast.location_lng) {
                                    mapRef.flyTo([toast.location_lat, toast.location_lng], 16, { animate: true });
                                    setSelectedListingId(`${toast.type}-${toast.id}`);
                                }
                            }}
                        >
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow" style={{ backgroundColor: style.hex }}>
                                <span className="material-symbols-outlined text-lg">
                                    {toast.type === 'offer' ? 'volunteer_activism' : 'sos'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: toast.type === 'offer' ? '#6366f1' : '#f97316' }}>
                                        {toast.type === 'offer' ? 'NEW OFFER' : 'NEW NEED'}
                                    </span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 mt-1 truncate">{toast.title_or_description}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{toast.user_name || 'Community Member'} • {toast.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══════════ ISSUE #6: FLOATING ZOOM CONTROLS ═══════════ */}
            <div className="absolute bottom-28 md:bottom-8 right-4 z-[500] flex flex-col gap-2 pointer-events-auto">
                <button
                    onClick={() => mapRef?.zoomIn()}
                    className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all border border-slate-200 active:scale-90"
                    title="Zoom In"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
                <button
                    onClick={() => mapRef?.zoomOut()}
                    className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 hover:text-primary transition-all border border-slate-200 active:scale-90"
                    title="Zoom Out"
                >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <button
                    onClick={() => { if (mapRef && userLocation) mapRef.flyTo(userLocation, 14); }}
                    className="bg-primary/95 shadow-lg rounded-xl p-2.5 text-white hover:bg-primary transition-all active:scale-90"
                    title="Recenter to My Location"
                >
                    <span className="material-symbols-outlined text-[20px]">my_location</span>
                </button>
            </div>

            {/* ═══════════ DESKTOP: FLOATING LEFT PANEL (hidden on mobile) ═══════════ */}
            <div className="hidden md:flex relative z-[400] w-[340px] m-4 flex-col gap-4 pointer-events-none h-[calc(100vh-8rem)]">

                {/* Header & Emergency Mode */}
                <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border pointer-events-auto shrink-0 flex flex-col gap-3 ${isEmergencyMode ? 'border-red-500/50 shadow-red-500/20' : (hillStationDangerMode ? 'border-orange-500/50 shadow-orange-500/20' : 'border-white/40')}`}>
                    {hillStationDangerMode && (
                        <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-center flex items-center justify-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-[14px]">landscape</span>
                            Hill Station Danger Mode ACTIVE
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className={`text-lg font-black flex items-center gap-2 ${isEmergencyMode ? 'text-red-600' : (hillStationDangerMode ? 'text-orange-600' : 'text-slate-900')}`}>
                                <span className={`material-symbols-outlined ${isEmergencyMode ? 'text-red-500' : 'text-primary'}`}>explore</span>
                                Map Radar
                            </h2>
                            {/* Live Socket Status */}
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${socketStatus === 'connected' ? 'bg-green-100 text-green-700' :
                                socketStatus === 'connecting' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${socketStatus === 'connected' ? 'bg-green-500' :
                                    socketStatus === 'connecting' ? 'bg-amber-500' :
                                        'bg-red-500'
                                    }`} style={{ animation: socketStatus === 'connected' ? 'live-pulse 2s ease-in-out infinite' : 'none' }}></span>
                                {socketStatus === 'connected' ? 'LIVE' : socketStatus === 'connecting' ? 'SYNC' : 'OFF'}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                            className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${isEmergencyMode ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                            title="Disaster Mode overrides colors to highlight medical emergencies in Red."
                        >
                            <span className="material-symbols-outlined text-[18px]">{isEmergencyMode ? 'warning' : 'health_and_safety'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className={`${isEmergencyMode ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} border rounded-xl p-2 flex flex-col items-center justify-center`}>
                            <span className={`text-xl font-black leading-none ${isEmergencyMode ? 'text-red-600' : 'text-slate-800'}`}>{activitySummary.requests}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isEmergencyMode ? 'text-red-400' : 'text-slate-400'}`}>Live Needs</span>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-2 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-primary leading-none">{activitySummary.offers}</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">Live Offers</span>
                        </div>
                    </div>

                    {/* Issue #6: Radius Selector */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">radar</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Radius</span>
                        <div className="flex gap-1 ml-auto">
                            {[1, 3, 5, 10].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRadiusKm(r)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${radiusKm === r ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {r}km
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border pointer-events-auto shrink-0 space-y-3 ${isEmergencyMode ? 'border-red-200/50' : 'border-white/40'}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Filters</h3>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{filters.length} Selected</span>
                    </div>
                    {renderFilterChips()}
                </div>

                {/* Feed / List View */}
                <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border pointer-events-auto flex-1 flex flex-col overflow-hidden ${isEmergencyMode ? 'border-red-200/50' : 'border-white/40'}`}>
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                        <h3 className="text-sm font-bold text-slate-800">
                            Nearby (<span className="text-primary">{filteredListings.length}</span>)
                        </h3>
                        <button onClick={() => { if (mapRef && userLocation) mapRef.flyTo(userLocation, 14); }} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">my_location</span> Recenter
                        </button>
                    </div>

                    <div ref={listContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                        {filteredListings.length === 0 ? renderEmptyState() : filteredListings.map(listing => renderListCard(listing))}
                    </div>
                </div>

                {/* Privacy Badge */}
                <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-3 pointer-events-auto shrink-0 shadow-lg border border-slate-700 mx-auto w-max flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-[16px]">lock</span>
                    <span className="text-[10px] font-medium text-slate-300">Location boundaries obfuscated.</span>
                </div>
            </div>

            {/* ═══════════ MOBILE: FLOATING HEADER BAR (visible only on mobile) ═══════════ */}
            <div className="md:hidden absolute top-4 left-4 right-20 z-[400] pointer-events-auto">
                <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border flex items-center justify-between gap-2 ${isEmergencyMode ? 'border-red-500/50' : (hillStationDangerMode ? 'border-orange-500/50' : 'border-white/40')}`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className={`text-sm font-black flex items-center gap-1.5 ${isEmergencyMode ? 'text-red-600' : 'text-slate-900'}`}>
                            <span className={`material-symbols-outlined text-[18px] ${isEmergencyMode ? 'text-red-500' : 'text-primary'}`}>explore</span>
                            Radar
                        </h2>
                        {/* Socket Status */}
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${socketStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`h-1 w-1 rounded-full ${socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} style={{ animation: socketStatus === 'connected' ? 'live-pulse 2s ease-in-out infinite' : 'none' }}></span>
                            {socketStatus === 'connected' ? 'LIVE' : 'OFF'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Mobile Radius Picker */}
                        <select
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[10px] font-bold text-slate-600 cursor-pointer"
                        >
                            {[1, 3, 5, 10].map(r => (
                                <option key={r} value={r}>{r}km</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                            className={`p-1.5 rounded-lg transition-all ${isEmergencyMode ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{isEmergencyMode ? 'warning' : 'health_and_safety'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════ MOBILE: LIST FAB (visible only on mobile) ═══════════ */}
            <button
                className="md:hidden fixed bottom-20 left-4 z-[500] bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2 border border-slate-200 active:scale-95 transition-all pointer-events-auto hover:shadow-2xl"
                onClick={() => setMobileListOpen(true)}
            >
                <span className={`material-symbols-outlined text-[20px] ${isEmergencyMode ? 'text-red-500' : 'text-primary'}`}>list_alt</span>
                <div className="text-left">
                    <span className="text-sm font-black text-slate-800 block leading-none">Nearby</span>
                    <span className="text-[10px] font-bold text-slate-400">{filteredListings.length} items • {radiusKm}km</span>
                </div>
            </button>

            {/* ═══════════ MOBILE: BOTTOM SHEET BACKDROP ═══════════ */}
            <div
                className={`md:hidden fixed inset-0 bg-black/50 z-[600] transition-opacity duration-300 ${mobileListOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileListOpen(false)}
            />

            {/* ═══════════ MOBILE: BOTTOM SHEET ═══════════ */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[650] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${mobileListOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '82vh' }}>
                {/* Handle bar */}
                <div className="flex justify-center py-3 cursor-pointer" onClick={() => setMobileListOpen(false)}>
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                </div>

                {/* Sheet Header */}
                <div className="px-4 pb-3 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900">
                        Nearby (<span className="text-primary">{filteredListings.length}</span>)
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="material-symbols-outlined text-[14px]">radar</span>
                            {radiusKm}km
                        </div>
                        <button
                            onClick={() => setMobileListOpen(false)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Filters inside sheet */}
                <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filters</h4>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{filters.length}</span>
                    </div>
                    {renderFilterChips()}
                </div>

                {/* Scrollable list */}
                <div className="overflow-y-auto p-4 space-y-3 pb-24" style={{ maxHeight: 'calc(82vh - 180px)' }}>
                    {filteredListings.length === 0 ? renderEmptyState() : filteredListings.map(listing => renderListCard(listing))}
                </div>
            </div>

        </div>
    );
}
