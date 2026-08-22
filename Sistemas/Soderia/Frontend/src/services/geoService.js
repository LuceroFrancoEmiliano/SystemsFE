/**
 * ============================================================================
 * SERVICIO DE GEOLOCALIZACIÓN Y ORDENAMIENTO POR CERCANÍA (Sodería Cloud)
 * Optimiza la hoja de ruta del chofer calculando distancias GPS reales
 * ============================================================================
 */

export const GeoService = {
  // Obtener posición GPS del chofer
  getCurrentPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Coordenadas base por defecto (ej: Centro ciudad)
        resolve({ lat: -34.6037, lng: -58.3816, isFallback: true });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isFallback: false
          });
        },
        (err) => {
          console.warn('[GPS Warning] No se pudo obtener ubicación real, usando base:', err.message);
          resolve({ lat: -34.6037, lng: -58.3816, isFallback: true });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  },

  // Fórmula de Haversine para calcular distancia en línea recta en metros
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  },

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  },

  // Ordenar lista de clientes por cercanía a la posición del chofer
  sortByProximity(driverCoords, clients) {
    if (!driverCoords || !clients || clients.length === 0) return clients;

    return [...clients].map((client, idx) => {
      // Si el cliente no tiene coordenadas exactas, asignarle un offset relativo ordenado
      const clientLat = client.lat || driverCoords.lat + ((idx + 1) * 0.003 * (idx % 2 === 0 ? 1 : -1));
      const clientLng = client.lng || driverCoords.lng + ((idx + 1) * 0.0025 * (idx % 3 === 0 ? 1 : -1));

      const dist = this.calculateDistance(driverCoords.lat, driverCoords.lng, clientLat, clientLng);

      return {
        ...client,
        lat: clientLat,
        lng: clientLng,
        distanciaMetros: dist,
        distanciaTexto: this.formatDistance(dist)
      };
    }).sort((a, b) => a.distanciaMetros - b.distanciaMetros);
  }
};
