const geocodeCache: { [key: string]: string } = {};

export const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    if (lat === 0 && lng === 0) return "N/A";
    
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (geocodeCache[cacheKey]) {
        return geocodeCache[cacheKey];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { headers: { 'User-Agent': 'Lawalx-Frontend/1.0' } }
        );
        const data = await response.json();

        if (data.display_name) {
            const a = data.address || {};
            const city = a.city || a.town || a.village || a.suburb || a.county || '';
            const country = a.country || '';
            const formatted = city && country ? `${city}, ${country}` : data.display_name.split(',').slice(0, 2).join(',');

            geocodeCache[cacheKey] = formatted;
            return formatted;
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    
    // Fallback if fetch fails
    return `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`;
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
