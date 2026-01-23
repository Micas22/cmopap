"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PawPrint, Phone, User, MapPin, Search, Filter } from "lucide-react";

// Custom animated marker icon
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `<div class="marker-inner relative flex items-center justify-center w-12 h-12 transition-all duration-500 ease-out origin-center">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-white shadow-lg items-center justify-center text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </span>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

const shelters = [
  {
    id: 1,
    name: "Abrigo de Olhão",
    position: [37.0286, -7.8411] as [number, number],
    count: 45,
    owner: "Maria Silva",
    contact: "+351 912 345 678"
  },
  {
    id: 2,
    name: "Patas Felizes",
    position: [37.0350, -7.8300] as [number, number],
    count: 20,
    owner: "João Santos",
    contact: "+351 965 432 109"
  },
  {
    id: 3,
    name: "Gatos da Ria",
    position: [37.0250, -7.8500] as [number, number],
    count: 30,
    owner: "Ana Costa",
    contact: "+351 933 221 144"
  }
];

const ShelterMarker = ({ shelter, isVisible }: { shelter: typeof shelters[0], isVisible: boolean }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      const el = marker.getElement();
      if (el) {
        const inner = el.querySelector('.marker-inner') as HTMLElement;
        if (inner) {
          if (isVisible) {
            inner.style.opacity = "1";
            inner.style.transform = "scale(1)";
            el.style.pointerEvents = "auto";
            el.style.zIndex = "auto";
          } else {
            inner.style.opacity = "0";
            inner.style.transform = "scale(0)";
            el.style.pointerEvents = "none";
            el.style.zIndex = "-1";
            marker.closePopup();
          }
        }
      }
    }
  }, [isVisible]);

  return (
    <Marker ref={markerRef} position={shelter.position} icon={customIcon}>
      <Popup className="custom-popup" closeButton={false}>
        <div className="p-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
              <PawPrint size={14} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">{shelter.name}</h3>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2 text-gray-500">
                <PawPrint size={12} />
                <span>Animais</span>
              </div>
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{shelter.count}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <User size={12} />
                <span>Responsável</span>
              </div>
              <span className="font-medium text-gray-700">{shelter.owner}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <Phone size={12} />
                <span>Contacto</span>
              </div>
              <span className="font-medium text-gray-700">{shelter.contact}</span>
            </div>

            <button className="w-full mt-2 bg-gray-900 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-1">
              <MapPin size={10} />
              Ver Detalhes
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default function ShelterMap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minAnimals, setMinAnimals] = useState(0);

  return (
    <div className="relative h-full w-full">
      {/* Sidebar / Filter Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl w-72 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Filter size={18} className="text-orange-500" />
          Filtrar Abrigos
        </h3>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Procurar por nome..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Mín. Animais</span>
              <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{minAnimals}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={minAnimals}
              onChange={(e) => setMinAnimals(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

    <MapContainer 
      center={[37.0286, -7.8411]} 
      zoom={15} 
      scrollWheelZoom={false} 
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {shelters.map((shelter) => {
        const isVisible = shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) && shelter.count >= minAnimals;
        return <ShelterMarker key={shelter.id} shelter={shelter} isVisible={isVisible} />;
      })}
    </MapContainer>
    </div>
  );
}