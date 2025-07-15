"use client";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState } from "react";
import { Place } from "@/types";

export default function ItineraryMap({ places }: { places: Place[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  if (!isLoaded || !places.length) return null;

  const containerStyle = {
    width: "100%",
    height: "100pc",
  };

  const center = {
    lat: places[0]?.latitude || -5.0,
    lng: places[0]?.longitude || -79.0,
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-2">🗺️ Mapa del Recorrido</h2>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {places
          .filter(
            (place) =>
              place.latitude !== undefined && place.longitude !== undefined
          )
          .map((place) => (
            <Marker
              key={place.id}
              position={{
                lat: place.latitude as number,
                lng: place.longitude as number,
              }}
              title={place.name}
              onClick={() => setActiveMarker(place.id)}
            >
              {activeMarker === place.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="max-w-xs">
                    <h3 className="font-bold text-sm">{place.name}</h3>
                    <p className="text-xs">{place.description}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>
    </section>
  );
}
