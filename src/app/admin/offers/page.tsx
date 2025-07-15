"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Offer {
  id: string;
  title: string;
  offer_type?: string;
  valid_from?: string;
  valid_to?: string;
  is_active: boolean;
  sponsor?: string;
  place_name?: string;
  district_name?: string;
  province_name?: string;
}

interface Place {
  name: string | null;
}

interface District {
  name: string | null;
}

interface Province {
  name: string | null;
}

interface RawOffer {
  id: string;
  title: string;
  offer_type?: string;
  valid_from?: string;
  valid_to?: string;
  is_active: boolean;
  sponsor?: string;
  places: Place[];
  districts: District[];
  provinces: Province[];
}

export default function OffersPage() {
  const supabase = createClientComponentClient();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from("offers")
        .select(
          `
          id,
          title,
          offer_type,
          valid_from,
          valid_to,
          is_active,
          sponsor,
          places ( name ),
          districts ( name ),
          provinces ( name )
        `
        )
        .order("valid_from", { ascending: false });

      if (error) {
        console.error("Error al cargar ofertas:", error);
        return;
      }

      const mapped = (data as RawOffer[]).map((offer) => ({
        id: offer.id,
        title: offer.title,
        offer_type: offer.offer_type,
        valid_from: offer.valid_from,
        valid_to: offer.valid_to,
        is_active: offer.is_active,
        sponsor: offer.sponsor,
        place_name: offer.places?.[0]?.name || "Sin lugar",
        district_name: offer.districts?.[0]?.name || "Sin distrito",
        province_name: offer.provinces?.[0]?.name || "Sin provincia",
      }));

      setOffers(mapped);
      setLoading(false);
    };

    fetchOffers();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ofertas promocionales</h1>

      {loading ? (
        <p>Cargando ofertas...</p>
      ) : offers.length === 0 ? (
        <p>No hay ofertas registradas.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Título</th>
                <th className="p-2">Lugar</th>
                <th className="p-2">Provincia</th>
                <th className="p-2">Distrito</th>
                <th className="p-2">Sponsor</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Desde</th>
                <th className="p-2">Hasta</th>
                <th className="p-2">Activo</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{offer.title}</td>
                  <td className="p-2">{offer.place_name}</td>
                  <td className="p-2">{offer.province_name}</td>
                  <td className="p-2">{offer.district_name}</td>
                  <td className="p-2">{offer.sponsor || "-"}</td>
                  <td className="p-2">{offer.offer_type || "-"}</td>
                  <td className="p-2">{offer.valid_from || "-"}</td>
                  <td className="p-2">{offer.valid_to || "-"}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        offer.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {offer.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
