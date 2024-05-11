"use client";

import React, { useState } from 'react';
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { calculateZoomLevel, strictOptions } from '@/lib/maps';

const containerStyle = {
  width: '600px',
  height: '400px'
};

export default function MapSearch({ googleMapsApiKey }: { googleMapsApiKey: string }) {

  const { isLoaded: isGoogleMapsJsApiLoaded } = useJsApiLoader({ googleMapsApiKey })
  const [locationQuery, setLocationQuery] = useState('');
  const [paths, setPaths]: [any, any] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: -34.6037181, lng: -58.38153 });
  const [zoom, setZoom] = useState(10); // Start with a world view
  const [mapKey, setMapKey] = useState(0); // State to control re-rendering of the map

  const handleSearch = async () => {
    try {
      const url = `/api/maps/search?q=${encodeURIComponent(locationQuery)}`
      console.log({ url });

      const response = await fetch(url);

      const { polygon, areaKm2, boundingbox, center } = await response.json();

      const newZoom = calculateZoomLevel(boundingbox, 600, 400)

      setPaths(polygon)
      setZoom(newZoom)
      setMapCenter(center)
      setMapKey(prevKey => prevKey + 1); // Increment map key to force re-render

      console.log({ newZoom, center });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    isGoogleMapsJsApiLoaded && (
      <div>
        <input
          type="text"
          value={locationQuery}
          onChange={e => setLocationQuery(e.target.value)}
          placeholder="Search for a location..."
        />
        <button onClick={handleSearch}>Search</button>
        <GoogleMap
          key={mapKey}
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={zoom}
          options={strictOptions}
        >
          {paths.length > 0 && <Polygon paths={paths} options={{ fillColor: "#FF0000", fillOpacity: 0.4, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }} />}
        </GoogleMap>
      </div>
    )
  );
}
