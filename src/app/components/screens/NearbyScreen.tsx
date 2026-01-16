import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation, Cross, AlertCircle, Crosshair, MapPin, Clock, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BottomNav } from '@/app/components/BottomNav';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { useApp } from '@/app/context/AppContext';

// Types
interface HealthCenter {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    rating?: number;
    isOpen?: boolean;
    type: 'hospital' | 'clinic' | 'pharmacy';
    distance?: string;
    time?: string;
}

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090, // New Delhi Default
};

// Fallback Mock Data
const STATIC_MOCK_HOSPITALS: HealthCenter[] = [
    {
        id: '1',
        name: 'Apollo Hospital',
        lat: 28.6139,
        lng: 77.2090,
        address: 'Sarita Vihar, Delhi Mathura Road',
        rating: 4.5,
        isOpen: true,
        type: 'hospital',
        distance: '2.5 km',
        time: '12 mins',
    },
    {
        id: '2',
        name: 'Max Super Speciality Hospital',
        lat: 28.6200,
        lng: 77.2100,
        address: 'Saket, New Delhi',
        rating: 4.7,
        isOpen: true,
        type: 'hospital',
        distance: '3.8 km',
        time: '18 mins',
    },
];

import { useTranslation } from '@/app/hooks/useTranslation';

export function NearbyScreen() {
    const { user } = useApp();
    const { t } = useTranslation();
    // Router Handling
    let location;
    try {
        location = useLocation();
    } catch (e) {
        location = { search: '' };
    }
    const searchParams = new URLSearchParams(location.search);
    const isEmergency = searchParams.get('emergency') === 'true';

    // State
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [nearbyPlaces, setNearbyPlaces] = useState<HealthCenter[]>(STATIC_MOCK_HOSPITALS);
    const [sheetState, setSheetState] = useState<'minimized' | 'medium' | 'expanded'>('medium');
    const [isLoading, setIsLoading] = useState(false);

    // Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- LOGIC: GENERATE MOCKS ---
    const generateMockPlaces = (lat: number, lng: number): HealthCenter[] => {
        const names = ["City Care Hospital", "General Health Clinic", "Emergency Center", "Community Health Post", "Specialty Medical Unit", "LifeLine Hospital", "Wellness Center", "Rapid Response Clinic", "City Care Hospital", "General Health Clinic"];
        return names.map((name, i) => {
            const latOffset = (Math.random() - 0.5) * 0.04;
            const lngOffset = (Math.random() - 0.5) * 0.04;
            return {
                id: `mock-${i}`,
                name: name,
                lat: lat + latOffset,
                lng: lng + lngOffset,
                address: `Sector ${Math.floor(Math.random() * 20) + 1}, Nearby`,
                rating: 4.0 + Math.random(),
                isOpen: true,
                type: 'hospital',
                distance: `${(Math.abs(latOffset) * 111).toFixed(1)} km`,
                time: `${Math.floor(Math.random() * 15) + 5} mins`,
            };
        });
    };

    // --- LOGIC: MAP ICONS ---
    const createCustomIcon = (type: 'user' | 'hospital') => {
        const iconMarkup = type === 'user'
            ? <div className="relative flex items-center justify-center w-8 h-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white"></span>
            </div>
            : <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-red-500 flex items-center justify-center transition-transform hover:scale-110">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </div>
                <div className="absolute -bottom-1 w-2 h-2 bg-red-500 rotate-45"></div>
            </div>;

        return L.divIcon({
            html: renderToStaticMarkup(iconMarkup),
            className: '',
            iconSize: type === 'user' ? [32, 32] : [32, 40],
            iconAnchor: type === 'user' ? [16, 16] : [16, 40],
            popupAnchor: [0, -40]
        });
    };

    // --- EFFECTS: INIT MAP ---
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([defaultCenter.lat, defaultCenter.lng], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        mapInstanceRef.current = map;
        locateUser(); // Auto start

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // --- LOGIC: FETCH ---
    const fetchNearbyHospitals = async (lat: number, lng: number) => {
        setIsLoading(true);
        try {
            const query = `
                [out:json][timeout:10];
                (
                  node["amenity"="hospital"](around:5000,${lat},${lng});
                  node["amenity"="clinic"](around:5000,${lat},${lng});
                );
                out center;    
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();

            if (!isMounted.current) return;

            if (data.elements && data.elements.length > 0) {
                const places: HealthCenter[] = data.elements.map((el: any) => {
                    const placeLat = el.lat || el.center?.lat;
                    const placeLng = el.lon || el.center?.lon;

                    // LANGUAGE LOGIC
                    const userLang = user?.language || 'en';
                    const preferredName = el.tags[`name:${userLang}`] || el.tags.name || el.tags['name:en'] || 'Health Center';

                    return {
                        id: el.id.toString(),
                        name: preferredName,
                        lat: placeLat,
                        lng: placeLng,
                        address: el.tags['addr:city'] || 'Location details unavailable',
                        rating: 4.2,
                        type: 'hospital',
                        distance: 'Nearby',
                        time: '10 min',
                    };
                }).slice(0, 50);
                setNearbyPlaces(places);
            } else {
                throw new Error("No data");
            }
        } catch (err) {
            console.warn("Using mocks");
            if (isMounted.current) setNearbyPlaces(generateMockPlaces(lat, lng));
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    };

    const locateUser = () => {
        if (!navigator.geolocation) return;
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!isMounted.current) return;
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([latitude, longitude], 15);
                }
                fetchNearbyHospitals(latitude, longitude);
            },
            () => { if (isMounted.current) setIsLoading(false); },
            { enableHighAccuracy: true }
        );
    };

    // --- EFFECTS: MARKERS ---
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        if (currentPosition) {
            markersRef.current.push(
                L.marker([currentPosition.lat, currentPosition.lng], { icon: createCustomIcon('user') }).addTo(map)
            );
        }

        nearbyPlaces.forEach(p => {
            const m = L.marker([p.lat, p.lng], { icon: createCustomIcon('hospital') }).addTo(map);
            m.on('click', () => {
                map.flyTo([p.lat, p.lng], 16);
                setSheetState('minimized'); // Show map when clicking pin
            });
            markersRef.current.push(m);
        });
    }, [currentPosition, nearbyPlaces]);

    const handleNavigate = (place: HealthCenter) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
    };

    const toggleSheet = () => {
        if (sheetState === 'expanded') setSheetState('medium');
        else if (sheetState === 'medium') setSheetState('expanded');
        else setSheetState('medium');
    };

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden">
            {/* 1. Full Screen Map Layer */}
            <div className="absolute inset-0 z-0">
                <div ref={mapContainerRef} className="h-full w-full" />

                {/* Controls Area */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                    <Button
                        size="icon"
                        className="rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-50 h-10 w-10"
                        onClick={locateUser}
                    >
                        <Crosshair className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
                    </Button>
                </div>

                {/* Emergency Banner */}
                {isEmergency && (
                    <div className="absolute top-4 left-4 right-16 z-[400] bg-red-600 text-white p-2 rounded-lg shadow-md flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span className="font-bold text-xs">EMERGENCY</span>
                        </div>
                        <Button variant="link" className="text-white text-xs font-bold underline p-0 h-auto" onClick={() => window.open('tel:108', '_self')}>
                            CALL 108
                        </Button>
                    </div>
                )}
            </div>

            {/* 2. Custom CSS Bottom Sheet 
                Using style={{ top: ... }} to slide it up/down
            */}
            <div
                className="fixed inset-x-0 bottom-0 z-[500] bg-white rounded-t-[20px] shadow-[0_-5px_30px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 ease-in-out"
                style={{
                    height: sheetState === 'expanded' ? '85%' : sheetState === 'medium' ? '45%' : '15%',
                    marginBottom: '60px' // Space for BottomNav
                }}
            >
                {/* Header (Always Visible) */}
                <div
                    className="w-full h-12 flex items-center justify-between px-4 border-b shrink-0 cursor-pointer bg-white rounded-t-[20px]"
                    onClick={toggleSheet}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{t('nearby_hospitals')}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{nearbyPlaces.length}</span>
                    </div>

                    {/* Toggle Button */}
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        {sheetState === 'expanded' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-2 pb-8">
                    {nearbyPlaces.map(place => (
                        <div
                            key={place.id}
                            className="bg-white p-3 mb-2 rounded-xl border border-gray-100 shadow-sm flex gap-3 active:scale-[0.99] transition-transform cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                mapInstanceRef.current?.flyTo([place.lat, place.lng], 16);
                                setSheetState('minimized'); // Minimize to show map
                            }}
                        >
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                                <Cross className="text-red-500 w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 truncate">{place.name}</h3>
                                <p className="text-xs text-gray-500 truncate mb-1">{place.address}</p>
                                <div className="flex gap-3 text-[10px] text-gray-600 font-medium">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {place.distance}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {place.time}</span>
                                </div>
                            </div>
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-blue-600 shrink-0 self-center shadow-md pb-0.5"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigate(place);
                                }}
                            >
                                <Navigation className="w-3.5 h-3.5 text-white" />
                            </Button>
                        </div>
                    ))}

                    {nearbyPlaces.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            No hospitals found.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Bottom Nav (Fixed on top of everything) */}
            <div className="z-[600]">
                <BottomNav />
            </div>
        </div>
    );
}
