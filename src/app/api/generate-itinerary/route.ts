import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { FormData, Place, PlaceStats, Offer } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type CleanPlace = Pick<
  Place,
  | "name"
  | "type"
  | "description"
  | "effort_level"
  | "price_range"
  | "local_foods"
  | "cultural_notes"
>;

/**
 * Asegura que el valor sea un array de strings
 */
function toSafeStringArray(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((s) => String(s).trim());
  if (typeof input === "string") return input.split(",").map((s) => s.trim());
  return [];
}

/**
 * Genera el prompt para OpenAI basado en los datos del formulario y lugares
 */
function buildPrompt({
  days,
  form,
  provinceData,
  districtData,
  stats,
  climate,
  places,
}: {
  days: number;
  form: FormData;
  provinceData: { name: string; description: string };
  districtData: { name: string; description: string };
  stats: PlaceStats;
  climate: string;
  places: CleanPlace[];
}): string {
  const limitedPlaces = places.slice(0, 10); // Evita prompt demasiado largo

  return `
Eres un experto en turismo peruano. Planifica un itinerario turístico personalizado de ${days} día(s) basado en:

📍 Provincia: ${provinceData.name}
📝 ${provinceData.description || "Sin descripción disponible."}

📍 Distrito: ${districtData.name}
📝 ${districtData.description || "Sin descripción disponible."}

🗓️ Fechas: del ${form.dateStart} al ${form.dateEnd}
🎯 Tipo de experiencia: ${form.experience_type}
💪 Esfuerzo físico: ${form.effort_level}
💰 Presupuesto: ${form.price_range}
⭐ Prioridad personal: ${form.priority}
🌤️ Clima estimado: ${climate}

🍽️ Comidas típicas destacadas: ${stats.foods.join(", ") || "Desconocidas"}
📜 Notas culturales: ${stats.cultures.join(", ") || "No especificadas"}

🏞️ Lugares sugeridos:
${limitedPlaces
  .map(
    (p, i) =>
      `(${i + 1}) ${p.name} - ${p.type || "sin tipo"}\nDescripción: ${
        p.description || "Sin descripción."
      }\nComida: ${
        toSafeStringArray(p.local_foods).join(", ") || "N/A"
      }\nNota cultural: ${
        toSafeStringArray(p.cultural_notes).join(", ") || "N/A"
      }`
  )
  .join("\n\n")}

📝 Devuelve un itinerario día por día con:
- Nombre del día
- Actividades variadas (1 o 2 por día)
- Horario tentativo (mañana / tarde)
- Almuerzo sugerido
- Nota cultural si aplica
-Presupuesto estimado de gastos en soles por persona
- En español, formato claro tipo guía de viaje.
`.trim();
}

export async function POST(req: Request) {
  try {
    const {
      form,
      days,
      places,
      stats,
      climate,
      offers,
    }: {
      form: FormData;
      days: number;
      places: Place[];
      stats: PlaceStats;
      climate: string;
      offers: Offer[];
    } = await req.json();

    console.log("🔍 Recibido en API:", {
      form,
      days,
      places,
      stats,
      climate,
    });

    // Validación básica
    if (
      !form?.provinceId ||
      !form?.districtId ||
      !form?.experience_type ||
      !places?.length ||
      !days
    ) {
      return NextResponse.json(
        { error: "Datos insuficientes para generar el itinerario." },
        { status: 400 }
      );
    }

    // Datos de provincia y distrito
    const [{ data: provinceData }, { data: districtData }] = await Promise.all([
      supabase
        .from("provinces")
        .select("name, description")
        .eq("id", form.provinceId)
        .single(),
      supabase
        .from("districts")
        .select("name, description")
        .eq("id", form.districtId)
        .single(),
    ]);

    if (!provinceData || !districtData) {
      return NextResponse.json(
        { error: "No se encontraron datos de provincia o distrito." },
        { status: 404 }
      );
    }

    const cleanPlaces: CleanPlace[] = places.map((p) => ({
      name: p.name,
      type: p.type,
      description: p.description,
      effort_level: p.effort_level,
      price_range: p.price_range,
      local_foods: toSafeStringArray(p.local_foods),
      cultural_notes: toSafeStringArray(p.cultural_notes),
    }));

    const prompt = buildPrompt({
      form,
      days,
      provinceData,
      districtData,
      stats,
      climate,
      places: cleanPlaces,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1600,
    });

    const result = completion.choices[0].message.content?.trim();

    return NextResponse.json({
      success: true,
      result,
      provinceInfo: provinceData,
      districtInfo: districtData,
      offers, // reenviado para uso en frontend
    });
  } catch (error) {
    console.error("❌ Error generando itinerario:", error);
    return NextResponse.json(
      { success: false, error: "Error interno generando el itinerario." },
      { status: 500 }
    );
  }
}
