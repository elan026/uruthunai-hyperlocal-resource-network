import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Pre-define icons based on categories for leaflet since default icons sometimes break in React
const createCategoryIcon = (color, iconName) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
                <span class="material-symbols-outlined" style="color: white; font-size: 20px;">${iconName}</span>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

const categoryIcons = {
    'Medical Help': createCategoryIcon('#ef4444', 'medical_services'),   // Red
    'Shelter': createCategoryIcon('#3b82f6', 'home_work'),          // Blue
    'Water & Food': createCategoryIcon('#22c55e', 'water_drop'),    // Green
    'Electricity / Generator': createCategoryIcon('#eab308', 'electric_bolt'), // Yellow
    'Transport': createCategoryIcon('#a855f7', 'local_shipping'),   // Purple
    'Volunteers': createCategoryIcon('#f97316', 'group'),           // Orange
};

const defaultIcon = createCategoryIcon('#64748b', 'place'); // Slate fallback

// Helper component to track map movements and fetch data inside Bounding Box
const MapBoundsTracker = ({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouthWest().lat,
                maxLat: bounds.getNorthEast().lat,
                minLng: bounds.getSouthWest().lng,
                maxLng: bounds.getNorthEast().lng
            });
        }
    });

    // Fire once on mount
    useEffect(() => {
        const bounds = map.getBounds();
        onBoundsChange({
            minLat: bounds.getSouthWest().lat,
            maxLat: bounds.getNorthEast().lat,
            minLng: bounds.getSouthWest().lng,
            maxLng: bounds.getNorthEast().lng
        });
    }, [map, onBoundsChange]);

    return null;
};

export default function MapContainer({ resources = [], onBoundsChange, center = [13.0033, 80.2555], zoom = 14 }) {
    return (
        <div className="w-full h-full relative z-0">
            <LeafletMap
                center={center}
                zoom={zoom}
                className="w-full h-full"
                scrollWheelZoom={true}
                zoomControl={false} // We will use custom zoom controls if needed or keep default out of the way
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    maxZoom={20}
                />

                {onBoundsChange && <MapBoundsTracker onBoundsChange={onBoundsChange} />}

                {resources.map((res) => {
                    // Only render if we actually have geographic coordinates
                    if (!res.location_lat || !res.location_lng) return null;

                    const icon = categoryIcons[res.category] || defaultIcon;

                    return (
                        <Marker
                            key={res.id}
                            position={[res.location_lat, res.location_lng]}
                            icon={icon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {res.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1 leading-tight">{res.title}</h3>
                                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{res.description}</p>
                                    <a
                                        href={`/resource/${res.id}`}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        View details &rarr;
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </LeafletMap>
        </div>
    );
}
