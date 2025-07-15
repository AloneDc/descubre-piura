import { Province, District, FormData } from "@/types";
import React from "react";

interface Props {
  provinces: Province[];
  districts: District[];
  form: FormData;
  onChange: (key: keyof FormData, value: string) => void;
}

const LocationSelector: React.FC<Props> = ({
  provinces,
  districts,
  form,
  onChange,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="font-semibold">Provincia</label>
        <select
          className="w-full border p-2 rounded-md"
          value={form.provinceId}
          onChange={(e) => onChange("provinceId", e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {form.provinceId && (
        <div>
          <label className="font-semibold">Distrito</label>
          <select
            className="w-full border p-2 rounded-md"
            value={form.districtId}
            onChange={(e) => onChange("districtId", e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {districts
              .filter((d) => d.province_id === form.provinceId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
