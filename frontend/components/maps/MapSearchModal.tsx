"use client";

import React, { useState } from 'react';
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { calculateZoomLevel, strictOptions } from '@/lib/maps';
import Modal from '@/components/Modal';

const containerStyle = {
  width: '600px',
  height: '400px'
};

export default function MapSearchModal({
  googleMapsApiKey,
  isOpen,
  closeModal,
  onUpdate = ()=>{}
}: {
  googleMapsApiKey: string,
  isOpen: boolean,
  closeModal: any,
  onUpdate?: any
}) {

  const { isLoaded: isGoogleMapsJsApiLoaded } = useJsApiLoader({ googleMapsApiKey })
  const [locationQuery, setLocationQuery] = useState('');
  const [paths, setPaths]: [any, any] = useState([]);
  const [area, setArea] = useState(0)
  const [mapCenter, setMapCenter] = useState({ lat: -34.6037181, lng: -58.38153 });
  const [zoom, setZoom] = useState(10); // Start with a world view
  const [mapKey, setMapKey] = useState(0); // State to control re-rendering of the map

  const handleSearch = async () => {
    try {
      const url = `/api/maps/search?q=${encodeURIComponent(locationQuery)}`
      const response = await fetch(url);
      const { polygon, areaKm2, boundingbox, center } = await response.json();

      // TODO: make responsive
      const newZoom = calculateZoomLevel(boundingbox, 600, 400)

      setPaths(polygon)
      setZoom(newZoom)
      setMapCenter(center)
      setMapKey(prevKey => prevKey + 1); // Increment map key to force re-render
      setArea(areaKm2)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const resetState = () => {
    setLocationQuery('')
    setPaths([])
    setArea(0)
  }

  const handleConfirm = (e: any) => {
    onUpdate({
      polygon: paths,
      area,
      name: locationQuery.trim()
    })
    closeModal()
    resetState()
  }

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      {isGoogleMapsJsApiLoaded && (
        <div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mb-2">
            <input
              type="text"
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              placeholder="Search for a location..."
              onKeyDown={handleKeyDown}
              className="w-full p-1 outline-none" />
            <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
              Search
            </button>
          </div>
          <GoogleMap
            key={mapKey}
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={zoom}
            options={strictOptions}>
            {paths.length > 0 && <Polygon paths={paths} options={{ fillColor: "#FF0000", fillOpacity: 0.4, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }} />}
          </GoogleMap>
          <div className="flex w-full justify-center mt-2">
            <button onClick={handleConfirm} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Confirm
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
