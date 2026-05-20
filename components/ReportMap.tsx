"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix Leaflet default icon paths
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Styled orange marker for selected location
const orangeIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; width:32px; height:44px;">
      <div style="
        position:absolute;
        bottom:0;
        left:50%;
        transform:translateX(-50%);
        width:32px;
        height:44px;
      ">
        <svg viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28S32 28 32 16C32 7.16 24.84 0 16 0z" fill="#f97316"/>
          <circle cx="16" cy="16" r="7" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#f97316"/>
        </svg>
      </div>
      <div style="
        position:absolute;
        bottom:-4px;
        left:50%;
        transform:translateX(-50%);
        width:16px;
        height:8px;
        background: radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%);
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

interface LocationMarkerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
}

function LocationMarker({ onLocationSelect, position, setPosition }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (onLocationSelect) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, Math.max(map.getZoom(), 15), { animate: true, duration: 0.8 });
      }
    },
  });

  // Set crosshair cursor on the map container
  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = "crosshair";
    return () => {
      container.style.cursor = "";
    };
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={orangeIcon} />
  );
}

export default function ReportMap({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  return (
    <MapContainer
      center={[37.0286, -7.8411]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        onLocationSelect={onLocationSelect}
        position={position}
        setPosition={setPosition}
      />
    </MapContainer>
  );
}