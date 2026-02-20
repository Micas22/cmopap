"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PawPrint, Phone, User, MapPin, Search, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Shelter {
  id: number;
  name: string;
  position: [number, number];
  count: number;
  owner: string;
  contact: string;
}

// Custom animated marker icon for shelters
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

// Temporary marker icon for selected location
const tempIcon = L.divIcon({
  className: "temp-marker",
  html: `<div class="marker-inner relative flex items-center justify-center w-12 h-12 transition-all duration-500 ease-out origin-center">
    <span class="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-lg items-center justify-center text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </span>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});



const ShelterMarker = ({ shelter, isVisible }: { shelter: Shelter, isVisible: boolean }) => {
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
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [newShelter, setNewShelter] = useState({
    nome: '',
    responsavel: '',
    contacto: '',
    num_animais: 0,
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('/api/admin/colonias');
        if (response.ok) {
          const colonias = await response.json();
          const shelterData: Shelter[] = colonias.map((colonia: any) => ({
            id: colonia.id,
            name: colonia.nome,
            position: [colonia.latitude, colonia.longitude] as [number, number],
            count: colonia.num_animais,
            owner: colonia.responsavel,
            contact: colonia.contacto
          }));
          setShelters(shelterData);
        }
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    fetchShelters();
  }, []);

  const handleCreateShelter = async () => {
    if (!newShelter.nome || !newShelter.responsavel || !newShelter.contacto || !selectedLocation) {
      alert('Por favor, preencha todos os campos e selecione uma localização no mapa.');
      return;
    }

    try {
      const response = await fetch('/api/admin/colonias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShelter),
      });

      if (response.ok) {
        const createdShelter = await response.json();
        const newShelterData: Shelter = {
          id: createdShelter.id,
          name: createdShelter.nome,
          position: [createdShelter.latitude, createdShelter.longitude],
          count: createdShelter.num_animais,
          owner: createdShelter.responsavel,
          contact: createdShelter.contacto,
        };
        setShelters([...shelters, newShelterData]);
        setIsDialogOpen(false);
        setSelectedLocation(null);
        setNewShelter({
          nome: '',
          responsavel: '',
          contacto: '',
          num_animais: 0,
          latitude: 0,
          longitude: 0,
        });
      } else {
        alert('Erro ao criar abrigo. Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating shelter:', error);
      alert('Erro ao criar abrigo. Tente novamente.');
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isSelectingLocation) {
          setSelectedLocation([e.latlng.lat, e.latlng.lng]);
          setIsSelectingLocation(false);
          setNewShelter({
            ...newShelter,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
        }
      },
    });
    return null;
  };

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

          {!selectedLocation ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 text-center">
                Clique no mapa para selecionar a localização
              </div>
              <Button
                onClick={() => setIsSelectingLocation(true)}
                disabled={isSelectingLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <MapPin size={16} />
                Selecionar Localização
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 text-center">
                Localização selecionada: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
              </div>
              <Button
                onClick={() => setIsSelectingLocation(true)}
                disabled={isSelectingLocation}
                variant="outline"
                className="w-full text-xs py-1"
              >
                Alterar Localização
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Adicionar Abrigo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Abrigo</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="nome" className="text-right text-sm font-medium">
                        Nome
                      </label>
                      <Input
                        id="nome"
                        value={newShelter.nome}
                        onChange={(e) => setNewShelter({ ...newShelter, nome: e.target.value })}
                        className="col-span-3"
                        placeholder="Nome do abrigo"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="responsavel" className="text-right text-sm font-medium">
                        Responsável
                      </label>
                      <Input
                        id="responsavel"
                        value={newShelter.responsavel}
                        onChange={(e) => setNewShelter({ ...newShelter, responsavel: e.target.value })}
                        className="col-span-3"
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="contacto" className="text-right text-sm font-medium">
                        Contacto
                      </label>
                      <Input
                        id="contacto"
                        value={newShelter.contacto}
                        onChange={(e) => setNewShelter({ ...newShelter, contacto: e.target.value })}
                        className="col-span-3"
                        placeholder="Número de telefone"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="num_animais" className="text-right text-sm font-medium">
                        N.º Animais
                      </label>
                      <Input
                        id="num_animais"
                        type="number"
                        value={newShelter.num_animais}
                        onChange={(e) => setNewShelter({ ...newShelter, num_animais: Number(e.target.value) })}
                        className="col-span-3"
                        placeholder="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm font-medium">
                        Localização
                      </label>
                      <div className="col-span-3 text-sm text-gray-600">
                        Localização selecionada: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateShelter} className="bg-orange-500 hover:bg-orange-600">
                      Criar Abrigo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
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
      <MapClickHandler />
      {selectedLocation && (
        <Marker position={selectedLocation} icon={tempIcon}>
          <Popup>
            <div className="text-sm text-gray-700">
              Localização selecionada para novo abrigo
            </div>
          </Popup>
        </Marker>
      )}
      {shelters.map((shelter) => {
        const isVisible = shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) && shelter.count >= minAnimals;
        return <ShelterMarker key={shelter.id} shelter={shelter} isVisible={isVisible} />;
      })}
    </MapContainer>
    </div>
  );
}