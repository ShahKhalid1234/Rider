import React, { useEffect, useRef } from 'react';
import { LatLng, RideStatus } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Info,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';

export const ACCESSIBLE_LOCATIONS = [
  {
    name: 'Anantnag Lal Chowk',
    latitude: 33.7300,
    longitude: 75.1500,
    address: 'Lal Chowk, Anantnag City, Jammu & Kashmir',
    type: 'District Hub',
    accessibility: 'Low-curb sidewalks, ramp-enabled local government hubs, accessible parking bays.',
    amenities: ['Low-curb Sidewalks', 'Ramp Entrances', 'Handicap Parking']
  },
  {
    name: 'Pahalgam Valley Resort',
    latitude: 34.0100,
    longitude: 75.1900,
    address: 'Main Market, Pahalgam, Jammu & Kashmir',
    type: 'Scenic Mountain Valley',
    accessibility: 'Wheelchair-accessible paved promenade along Lidder river, ramp-equipped parks, low-step boarding zones.',
    amenities: ['Lidder Promenade', 'Ramped Picnic Parks', 'Low-Step Boarding']
  },
  {
    name: 'Martand Sun Temple Ruins',
    latitude: 33.7456,
    longitude: 75.2203,
    address: 'Keharbal, Anantnag, Jammu & Kashmir',
    type: 'Ancient Heritage Site',
    accessibility: 'Hard-paved flat stone pathway to the ruins, resting benches at regular intervals, clear tactile guiding paths.',
    amenities: ['Tactile Pathways', 'Resting Benches', 'Step-Free Ruins Access']
  },
  {
    name: 'Kokernag Botanical Garden',
    latitude: 33.5872,
    longitude: 75.3013,
    address: 'Kokernag Springs, Anantnag, Jammu & Kashmir',
    type: 'Spring Sanctuary & Park',
    accessibility: 'Wide paved pedestrian walkways, accessible restrooms, gentle ramps near freshwater trout pools.',
    amenities: ['Accessible Restrooms', 'Wide Paths', 'Gentle Basin Ramps']
  },
  {
    name: 'Achabal Mughal Garden',
    latitude: 33.6839,
    longitude: 75.2195,
    address: 'Achabal Garden Rd, Achabal, Jammu & Kashmir',
    type: 'Historical Terraced Garden',
    accessibility: 'Smooth stone pathways around main terraced layouts, supportive handrails near water cascading springs.',
    amenities: ['Springside Handrails', 'Smooth Walkways', 'Wheelchair Rest Zones']
  },
  {
    name: 'Verinag Royal Spring',
    latitude: 33.5500,
    longitude: 75.2500,
    address: 'Source of Jhelum, Verinag, Jammu & Kashmir',
    type: 'Natural Spring Sanctuary',
    accessibility: 'Flat entry paths into the octagonal pool pavilion, wheelchair-friendly viewpoints of the Jhelum river origin.',
    amenities: ['Flat Pavilion Entry', 'Jhelum Viewpoint', 'Tactile Signboards']
  }
];

interface MapViewProps {
  pickup: LatLng | null;
  destination: LatLng | null;
  riderLocation: LatLng | null;
  rideStatus: RideStatus | null;
  className?: string;
  onSelectPickup?: (location: typeof ACCESSIBLE_LOCATIONS[0]) => void;
  onSelectDestination?: (location: typeof ACCESSIBLE_LOCATIONS[0]) => void;
}

export default function MapView({
  pickup,
  destination,
  riderLocation,
  rideStatus,
  className = '',
  onSelectPickup,
  onSelectDestination
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map container once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around Anantnag city center
    const map = L.map(mapContainerRef.current, {
      center: [33.7300, 75.1500],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Custom attribution control
    L.control.attribution({ prefix: false }).addTo(map);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | ScootyRide Accessible Map'
    }).addTo(map);

    // Zoom control at bottom-right for clean visual rhythm
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Force a resize check in Leaflet to avoid grey container blocks
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers & Route lines when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear dynamic elements
    markersGroup.clearLayers();
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Custom CSS DivIcons to match the warm theme and avoid local asset path failures
    const pickupIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 bg-emerald-500/35 rounded-full animate-ping"></span>
          <div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg font-black text-white text-[10px]">A</div>
        </div>
      `,
      className: 'custom-pin-pickup',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const destIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 bg-rose-500/35 rounded-full animate-ping"></span>
          <div class="w-8 h-8 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg font-black text-white text-[10px]">B</div>
        </div>
      `,
      className: 'custom-pin-dest',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const riderIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-10 h-10 bg-amber-500/25 rounded-full animate-pulse"></span>
          <div class="w-10 h-10 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-lg">🛵</div>
        </div>
      `,
      className: 'custom-pin-rider',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const placeIcon = L.divIcon({
      html: `
        <div class="w-6 h-6 bg-emerald-50 rounded-full border border-emerald-600 flex items-center justify-center shadow-md text-xs font-bold text-emerald-800 hover:scale-115 transition">
          ♿
        </div>
      `,
      className: 'custom-pin-place',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const bounds: L.LatLngTuple[] = [];

    // Plot all Accessible Locations as markers
    ACCESSIBLE_LOCATIONS.forEach(place => {
      const marker = L.marker([place.latitude, place.longitude], { icon: placeIcon }).addTo(markersGroup);
      
      const popupContent = `
        <div class="p-2 max-w-[210px] space-y-1 font-semibold text-slate-800">
          <div class="flex items-center space-x-1">
            <span class="text-xs bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black border border-emerald-200">♿ Accessible</span>
          </div>
          <h5 class="font-black text-xs text-slate-900 m-0 pt-1">${place.name}</h5>
          <p class="text-[9px] text-slate-400 font-extrabold uppercase m-0 leading-none">${place.type}</p>
          <p class="text-[10.5px] text-slate-600 leading-snug m-0 pt-1">${place.accessibility}</p>
          <div class="flex flex-wrap gap-1 pt-1.5">
            ${place.amenities.map(a => `<span class="text-[8px] bg-slate-50 text-slate-700 px-1 py-0.5 rounded font-bold border border-slate-100">${a}</span>`).join('')}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { closeButton: false, className: 'custom-leaflet-popup' });
    });

    if (pickup) {
      L.marker([pickup.latitude, pickup.longitude], { icon: pickupIcon }).addTo(markersGroup);
      bounds.push([pickup.latitude, pickup.longitude]);
    }

    if (destination) {
      L.marker([destination.latitude, destination.longitude], { icon: destIcon }).addTo(markersGroup);
      bounds.push([destination.latitude, destination.longitude]);
    }

    if (riderLocation) {
      L.marker([riderLocation.latitude, riderLocation.longitude], { icon: riderIcon }).addTo(markersGroup);
      bounds.push([riderLocation.latitude, riderLocation.longitude]);
    }

    // Connect pickup and destination with a golden trail line
    if (pickup && destination) {
      const line = L.polyline(
        [[pickup.latitude, pickup.longitude], [destination.latitude, destination.longitude]],
        { color: '#f59e0b', weight: 4.5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }
      ).addTo(map);
      routeLineRef.current = line;
    }

    // Auto-center or fit bounds of active route elements
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([33.7300, 75.1500], 11);
    }
  }, [pickup, destination, riderLocation, rideStatus]);

  return (
    <div className={`relative flex flex-col bg-slate-50 border border-slate-100 shadow-md ${className}`} id="map_view_container">
      
      {/* Top Interactive Banner Control */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-auto bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black tracking-tight text-slate-800 uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>OpenStreetMap Live (Anantnag District)</span>
          </span>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-black uppercase">
          100% Free & Open Source
        </span>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="relative flex-grow h-[320px] sm:h-[400px] w-full z-0" />

      {/* Accessible Location Directory & Hotspot Selector */}
      <div className="bg-white border-t border-slate-100 p-4 space-y-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-4.5 h-4.5 text-emerald-600" />
            <h4 className="font-extrabold text-xs text-slate-800 tracking-tight flex items-center gap-1">
              <span>Anantnag Accessible Directory</span>
              <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Wheelchair Friendly
              </span>
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">Select any destination below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACCESSIBLE_LOCATIONS.map((loc) => {
            const isPickup = pickup && Math.abs(pickup.latitude - loc.latitude) < 0.0001 && Math.abs(pickup.longitude - loc.longitude) < 0.0001;
            const isDest = destination && Math.abs(destination.latitude - loc.latitude) < 0.0001 && Math.abs(destination.longitude - loc.longitude) < 0.0001;

            return (
              <div
                key={loc.name}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isPickup
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : isDest
                    ? 'border-rose-500 bg-rose-50/30'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-xs text-slate-800 tracking-tight">{loc.name}</h5>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{loc.type}</p>
                  </div>
                  {isPickup && <span className="text-[8px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase">Pickup</span>}
                  {isDest && <span className="text-[8px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase">Dropoff</span>}
                </div>

                <p className="text-[10px] text-slate-600 leading-relaxed font-semibold mt-1.5 min-h-[30px]">
                  {loc.accessibility}
                </p>

                {/* Quick Selection Buttons */}
                <div className="flex space-x-1.5 mt-2.5 pt-2 border-t border-slate-100/50">
                  <button
                    onClick={() => onSelectPickup?.(loc)}
                    disabled={isPickup}
                    className="flex-1 py-1 text-[9px] font-black rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Set Pickup
                  </button>
                  <button
                    onClick={() => onSelectDestination?.(loc)}
                    disabled={isDest}
                    className="flex-1 py-1 text-[9px] font-black rounded-lg border border-rose-500 text-rose-700 hover:bg-rose-500 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Set Dropoff
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
