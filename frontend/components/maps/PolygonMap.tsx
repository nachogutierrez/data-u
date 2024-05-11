"use client";

import React from 'react'

import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { calculateZoomLevel, strictOptions } from '@/lib/maps';

type PolygonMapProps = {
    googleMapsApiKey: string,
    polygon: { lat: number, lng: number }[]
    boundingbox: number[],
    center: { lat: number, lng: number },
    width: number,
    height: number
}

export default function PolygonMap({
    googleMapsApiKey,
    polygon,
    boundingbox,
    center,
    width,
    height
}: PolygonMapProps) {

    const { isLoaded: isGoogleMapsJsApiLoaded } = useJsApiLoader({ googleMapsApiKey })

    const zoom = calculateZoomLevel(boundingbox, width, height)

    const containerStyle = {
        width: `${width}px`,
        height: `${height}px`
    };

    return (
        isGoogleMapsJsApiLoaded && (
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                options={strictOptions}>
                {polygon.length > 0 && <Polygon paths={polygon} options={{ fillColor: "#FF0000", fillOpacity: 0.4, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }} />}
              </GoogleMap>
          )
    )
}
