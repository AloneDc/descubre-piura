import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FormData } from "@/types";

interface Props {
  form: FormData;
  onChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}

const ExperienceSelector: React.FC<Props> = ({ form, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="font-semibold block">Tipo de experiencia</label>
        <select
          className="w-full border p-2 rounded-md"
          value={form.experience_type}
          onChange={(e) => onChange("experience_type", e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          {["cultura", "gastronomía", "aventura", "naturaleza"].map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold block mb-1">Nivel de esfuerzo</label>
        <Slider
          min={1}
          max={3}
          step={1}
          marks={{ 1: "Bajo", 2: "Medio", 3: "Alto" }}
          value={form.effort_level}
          onChange={(v) => typeof v === "number" && onChange("effort_level", v)}
        />
      </div>

      <div>
        <label className="font-semibold block mb-1">Presupuesto</label>
        <Slider
          min={1}
          max={3}
          step={1}
          marks={{ 1: "Bajo", 2: "Medio", 3: "Alto" }}
          value={form.price_range}
          onChange={(v) => typeof v === "number" && onChange("price_range", v)}
        />
      </div>
    </div>
  );
};

export default ExperienceSelector;
