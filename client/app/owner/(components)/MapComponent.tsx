// MapComponent.tsx
"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const MapRecenter = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 16);
    }, [position, map]);
    return null;
};

const ClickHandler = ({ setPosition, setFormData }: any) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setFormData((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));
        },
    });
    return null;
};

export default function MapComponent({ position, setPosition, setFormData }: any) {
    return (
        <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapRecenter position={position} />
            <ClickHandler setPosition={setPosition} setFormData={setFormData} />
            {position && <Marker position={position} icon={DefaultIcon} />}
        </MapContainer>
    );
}