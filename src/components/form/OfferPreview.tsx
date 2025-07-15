import React from "react";
import { Offer } from "@/types";

interface Props {
  offers: Offer[];
}

const OfferPreview: React.FC<Props> = ({ offers }) => {
  if (!offers.length) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mt-8 space-y-6 shadow">
      <h3 className="text-xl font-bold text-yellow-900">
        🎁 Ofertas que te pueden interesar
      </h3>
      <ul className="space-y-4">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="bg-white border-l-4 border-yellow-400 p-4 rounded shadow-sm"
          >
            <h4 className="text-lg font-semibold text-yellow-700">
              {offer.title}
            </h4>
            <p className="text-gray-700 text-sm mt-1">{offer.description}</p>
            {offer.valid_from && offer.valid_to && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Vigencia: {offer.valid_from} - {offer.valid_to}
              </p>
            )}

            <div className="mt-2">
              <button className="text-sm text-yellow-700 font-medium hover:underline">
                ¡Aprovecha ahora!
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OfferPreview;
