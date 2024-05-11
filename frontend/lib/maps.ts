export const strictOptions = {
  // zoomControl: false, // disables zoom controls
  // scrollwheel: false, // prevents zooming with the mouse scroll
  // disableDoubleClickZoom: true, // prevents zooming with double click
  // draggable: false, // prevents dragging
  // gestureHandling: 'none', // prevents all map gestures
  streetViewControl: false, // disables street view control
  fullscreenControl: false, // disables full-screen control
  mapTypeControl: false, // disables map type control (no satellite view toggle)
  disableDefaultUI: true, // This disables the default map UI elements
  styles: [ // Add this styles array to the options
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }] // This turns off points of interest labels
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }] // This can turn off transit labels if needed
    }
  ]
}

export function calculateZoomLevel(bounds: number[], containerWidth: number, containerHeight: number) {
  const [southWestLat, northEastLat, southWestLon, northEastLon] = bounds;
  const latRadians = (lat: number) => lat * (Math.PI / 180);

  // Calculate longitude and latitude spans
  let lonDiff = northEastLon - southWestLon;
  if (lonDiff < 0) {
    lonDiff += 360; // Correct for crossing the International Date Line
  }
  const latDiff = northEastLat - southWestLat;

  // Latitude adjustment factor due to Mercator projection scale change
  const midLat = (southWestLat + northEastLat) / 2;
  const latAdjust = Math.cos(latRadians(midLat));

  // GLOBE_WIDTH and GLOBE_HEIGHT in pixels at zoom level 0
  const GLOBE_WIDTH = 256; // a constant in Google Maps
  const GLOBE_HEIGHT = 256; // assuming square tiles

  // Calculate potential zoom levels for both dimensions
  const zoomFactorWidth = GLOBE_WIDTH * lonDiff * latAdjust / containerWidth;
  const zoomFactorHeight = GLOBE_HEIGHT * latDiff / containerHeight;

  // Calculate and adjust zoom level based on the more restrictive dimension
  const zoomLevelWidth = Math.log2(360 / zoomFactorWidth);
  const zoomLevelHeight = Math.log2(180 / zoomFactorHeight); // 180 due to lat range of -90 to 90

  const zoomLevel = Math.floor(Math.min(zoomLevelWidth, zoomLevelHeight));

  // Correction factor
  return zoomLevel*1.05;
}