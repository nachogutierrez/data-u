import simplify from "simplify-js";

function calculateSurfaceKm2(vertices: any) {
    let area = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n; // next vertex index, with wrap-around
        const xi = vertices[i].lng; // longitude of current vertex
        const yi = vertices[i].lat; // latitude of current vertex
        const xj = vertices[j].lng; // longitude of next vertex
        const yj = vertices[j].lat; // latitude of next vertex
        area += xi * yj - yi * xj; // cross product
    }

    // Multiplying by 10000 is necessary to convert to km2
    return Math.abs(area / 2) * 10000; // absolute value of half the computed cross product sum
}

// Finds the tolerance that produces n vertices
function toleranceBinarySearch(coordinates: any[], n = 50) {
    if (coordinates.length < n) {
        // Zero tolerance is enough
        return 0
    }

    let left = 0
    let right = 0.5
    let jumps = 0

    while (right - left >= 0.001) {
        jumps++
        const mid = (left + right) / 2
        const newCoordinates = simplifyPolygon(coordinates, mid, true)

        if (newCoordinates.length >= n) {
            left = mid
        } else {
            right = mid
        }
    }

    return (right + left) / 2
}

function simplifyPolygon(coordinates: any, tolerance: number, highQuality: boolean) {
    // Convert GeoJSON coordinates to a format suitable for simplify-js
    const points = coordinates.map((coord: any) => ({ x: coord.lng, y: coord.lat }));

    // Simplify the points
    let simplified = simplify(points, tolerance, highQuality);

    const cache = new Set()

    // Filter out consecutive duplicate points
    simplified = simplified.filter((pt: any, index: number) => {
        const { x, y } = pt
        const key = `${x.toFixed(3)}-${y.toFixed(3)}`
        if (cache.has(key)) {
            return false
        }
        cache.add(key)
        return true
    });

    // Ensure the polygon remains closed by appending the first point to the end if necessary
    if (simplified.length > 0) {
        const firstPt = simplified[0];
        const lastPt = simplified[simplified.length - 1];
        if (firstPt.x !== lastPt.x || firstPt.y !== lastPt.y) {
            simplified.push(firstPt);
        }
    }

    // Convert back to the original format if necessary
    return simplified.map(pt => ({ lat: pt.y, lng: pt.x }));
}

export type NominatimResponse = {
    polygon: { lat: number, lng: number }[],
    boundingbox: number[],
    center: { lat: number, lng: number },
    areaKm2: number
}

export async function runQuery(locationQuery: string): Promise<NominatimResponse> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&polygon_geojson=1&limit=1`
    const response = await fetch(url)
    const results = await response.json();
    const data = results[0]

    if (!data?.geojson?.coordinates) {
        throw new Error(`Nominatim query didn't yield any coordinates: '${locationQuery}'`)
    }

    let polygon: any[] = []
    if (data.geojson.type === 'MultiPolygon') {
        polygon = data.geojson.coordinates[0][0].map((coord: any) => ({ lat: coord[1], lng: coord[0] }));
    } else if (data.geojson.type === 'Polygon') {
        polygon = data.geojson.coordinates[0].map((coord: any) => ({ lat: coord[1], lng: coord[0] }));
    } else {
        throw new Error(`Unknown geojson type "${data.geojson.type}`)
    }

    const areaKm2 = calculateSurfaceKm2(polygon)
    const tolerance = toleranceBinarySearch(polygon, 50)

    polygon = simplifyPolygon(polygon, tolerance, true)
    const boundingbox = data.boundingbox.map(parseFloat)
    const center = { lat: parseFloat(data.lat), lng: parseFloat(data.lon) }

    return {
        polygon,
        areaKm2,
        boundingbox,
        center
    }
}