import { FormData } from "@/types";
import React from "react";
import clsx from "clsx";

interface Props {
  form: FormData;
  onChange: (key: keyof FormData, value: string) => void;
  days: number;
}

const DateRangeSelector: React.FC<Props> = ({ form, onChange, days }) => {
  const isInvalidRange =
    form.dateStart &&
    form.dateEnd &&
    new Date(form.dateEnd) < new Date(form.dateStart);

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
            "border-red-500": isInvalidRange,
          })}
          value={form.dateEnd}
          onChange={(e) => onChange("dateEnd", e.target.value)}
        />
      </div>

      <div className="md:col-span-2 text-sm text-gray-600 italic mt-2">
        Duración estimada: {days} día(s)
      </div>
    </div>
  );
};

export default DateRangeSelector;
