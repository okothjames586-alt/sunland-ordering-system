import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ driverLocation, deliveryAddress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-1.2864, 36.8172], 13); // Nairobi coordinates

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Add destination marker
    if (deliveryAddress && deliveryAddress.coordinates) {
      const { latitude, longitude } = deliveryAddress.coordinates;

      if (destinationMarkerRef.current) {
        mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
      }

      destinationMarkerRef.current = L.marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup('Delivery Address');

      // Fit map to show both markers if driver location exists
      if (driverLocation) {
        const bounds = L.latLngBounds([
          [latitude, longitude],
          [driverLocation.latitude, driverLocation.longitude]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else {
        mapInstanceRef.current.setView([latitude, longitude], 15);
      }
    }
  }, [deliveryAddress]);

  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return;

    const { latitude, longitude } = driverLocation;

    // Update or create driver marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([latitude, longitude]);
    } else {
      driverMarkerRef.current = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'driver-marker',
          html: '🚗',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('Driver Location');
    }

    // Update map view to follow driver
    if (deliveryAddress && deliveryAddress.coordinates) {
      const bounds = L.latLngBounds([
        [deliveryAddress.coordinates.latitude, deliveryAddress.coordinates.longitude],
        [latitude, longitude]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else {
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }
  }, [driverLocation, deliveryAddress]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {driverLocation && (
        <div className="map-info">
          <p>🚗 Driver is on the way!</p>
          <p>Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
