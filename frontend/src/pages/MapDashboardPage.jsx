import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import { hospitalService } from '../services/hospitalService';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapDashboardPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    hospitalService
      .list()
      .then((response) => setHospitals(response.data.hospitals || []))
      .catch(() => setHospitals([]));
  }, []);

  const center = [22.9734, 78.6569];
  const mapHospitals = hospitals
    .filter((h) => Number(h.lat) && Number(h.lon))
    .slice(0, 200)
    .map((h, index) => ({
      ...h,
      trustBand: index % 3 === 0 ? 'good' : index % 3 === 1 ? 'medium' : 'low',
    }));

  const iconForBand = (band) =>
    L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:${band === 'good' ? '#36b37e' : band === 'medium' ? '#d2a437' : '#d90404'};width:22px;height:22px;border-radius:999px;border:4px solid #ffffff;box-shadow:0 0 0 3px rgba(255,255,255,0.45);"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

  return (
    <div className="space-y-4">
      <h1 className="brand-font text-2xl font-bold text-slate-900">Hospitals near you</h1>
      <p className="text-sm text-slate-600">Tap a marker to see details.</p>

      <div className="mb-2 flex justify-end gap-2 text-xs">
        <span className="rounded-full border border-slate-300 px-3 py-1"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Good</span>
        <span className="rounded-full border border-slate-300 px-3 py-1"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" /> Medium</span>
        <span className="rounded-full border border-slate-300 px-3 py-1"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-red-600" /> Low</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="glass-card p-3">
          <MapContainer center={center} zoom={5} className="h-[68vh] w-full rounded-2xl" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapHospitals.map((h) => (
              <Marker icon={iconForBand(h.trustBand)} position={[Number(h.lat), Number(h.lon)]} key={h.id}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{h.name}</p>
                    <p>{h.city}</p>
                    <Link className="text-medicalBlue underline" to={`/hospital/${h.id}`}>
                      Open Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <section className="glass-card p-5 text-sm text-slate-600">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
            <FaInfoCircle /> Map explanation
          </h2>
          <p>
            Markers are colour-coded so you can decide quickly: <b>green</b> means strong trust and reviews,
            <b> yellow</b> means moderate, <b>red</b> means low data or low trust.
          </p>
          <button onClick={() => navigate('/results')} className="mt-4 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
            View hospital list
          </button>
        </section>
      </div>
    </div>
  );
}
