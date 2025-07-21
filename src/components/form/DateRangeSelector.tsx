import { FormData } from "@/types";
import React from "react";
import clsx from "clsx";

interface Props {
  form: FormData;
  onChange: (key: keyof FormData, value: string) => void;
  days: number;
}

const DateRangeSelector: React.FC<Props> = ({ form, onChange, days }) => {
  const startDate = form.dateStart ? new Date(form.dateStart) : null;
  const endDate = form.dateEnd ? new Date(form.dateEnd) : null;

  const isInvalidRange = startDate && endDate && endDate < startDate;

  const isTooLong =
    startDate &&
    endDate &&
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) > 6;

  const errorMessage = isInvalidRange
    ? "La fecha de fin no puede ser anterior a la de inicio."
    : isTooLong
    ? "El viaje no puede durar más de 7 días."
    : "";

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="font-semibold">Fecha de inicio</label>
        <input
          type="date"
          className="w-full border p-2 rounded-md"
          value={form.dateStart}
          onChange={(e) => onChange("dateStart", e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">Fecha de fin</label>
        <input
          type="date"
          className={clsx("w-full border p-2 rounded-md", {
            "border-red-500": isInvalidRange || isTooLong,
          })}
          value={form.dateEnd}
          onChange={(e) => onChange("dateEnd", e.target.value)}
          min={form.dateStart || undefined}
          disabled={!form.dateStart}
        />
      </div>

      <div className="md:col-span-2 text-sm text-gray-600 italic mt-2">
        {errorMessage ? (
          <span className="text-red-600">{errorMessage}</span>
        ) : (
          <>Duración estimada: {days} día(s)</>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;
