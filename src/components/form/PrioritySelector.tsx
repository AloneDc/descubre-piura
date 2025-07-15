import React from "react";
import { FormData } from "@/types";

interface Props {
  form: FormData;
  onChange: (key: keyof FormData, value: string) => void;
}

const PrioritySelector: React.FC<Props> = ({ form, onChange }) => {
  return (
    <div>
      <label className="font-semibold block">Prioridad principal</label>
      <select
        className="w-full border p-2 rounded-md"
        value={form.priority}
        onChange={(e) => onChange("priority", e.target.value)}
      >
        <option value="">-- Selecciona --</option>
        {["comodidad", "naturaleza", "cultura", "gastronomía", "aventura"].map(
          (p) => (
            <option key={p} value={p}>
              {p}
            </option>
          )
        )}
      </select>
    </div>
  );
};

export default PrioritySelector;
