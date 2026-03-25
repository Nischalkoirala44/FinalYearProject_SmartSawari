import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type ClickHandlerProps = {
    setPosition: React.Dispatch<React.SetStateAction<LatLng | null>>;
};

function ClickHandler({ setPosition }: ClickHandlerProps) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
}

type LocationPickerProps = {
    onSelect: (lat: number, lng: number) => void;
};

const LocationPicker = ({ onSelect }: LocationPickerProps) => {
    const [position, setPosition] = useState<LatLng | null>(null);

    const center: [number, number] = [27.7172, 85.3240]; // Kathmandu

    const handleConfirm = () => {
        if (position) {
            onSelect(position.lat, position.lng);
        }
    };

    return (
        <div className="border rounded-xl p-2 bg-slate-50">
            <div className="h-64 w-full rounded-lg overflow-hidden">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <ClickHandler setPosition={setPosition} />

                    {position && <Marker position={position} />}
                </MapContainer>
            </div>

            {position && (
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
                >
                    Confirm Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </button>
            )}
        </div>
    );
};

export default LocationPicker;
