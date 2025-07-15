"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import React from "react";

interface PlaceMarker {
  name: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  places: PlaceMarker[];
}

export default function MapWithMarkers({ places }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (loadError) return <div>Error cargando Google Maps</div>;
  if (!isLoaded) return <div>Cargando mapa…</div>;

  const center =
    places.length > 0
      ? { lat: places[0].latitude, lng: places[0].longitude }
      : { lat: -5.2, lng: -79.6 };

  return (
    <div className="w-full h-[400px] rounded shadow overflow-hidden">
      <GoogleMap
        zoom={13}
        center={center}
        mapContainerClassName="w-full h-full"
      >
        {places.map((place, index) => (
          <Marker
            key={index}
            position={{ lat: place.latitude, lng: place.longitude }}
            title={place.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
