export interface Province {
  id: string;
  name: string;
  description?: string;
}

export interface District {
  id: string;
  name: string;
  province_id: string;
  description?: string;
}

export interface Place {
  id: string;
  name: string;
  district_id: string;
  experience_type: string;
  effort_level: string;
  price_range: string;
  climate: string;
  description: string;
  local_foods: string[] | string;
  cultural_notes: string[] | string;
  type: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  related_places?: string[] | null;
}

export interface Offer {
  id: string;
  place_id: string;
  title: string;
  description: string;
  offer_type?: string;
  valid_from?: string;
  valid_to?: string;
  min_budget?: string;
  min_group_size?: number;
  sponsor?: string;
  url?: string;
  is_active?: boolean;
  province_id?: string | null;
  district_id?: string | null;
}

export interface FormData {
  provinceId: string;
  districtId: string;
  dateStart: string;
  dateEnd: string;
  experience_type: string;
  effort_level: number;
  price_range: number;
  priority: string;
}

export interface PlaceStats {
  foods: string[];
  cultures: string[];
  count: number;
}

export interface CleanPlace {
  name: string;
  type: string;
  description: string;
  effort_level: string;
  price_range: string;
  local_foods?: string[];
  cultural_notes?: string;
}

export interface ProvinceOrDistrict {
  name: string;
  description?: string;
}
export interface Admin {
  id: string;
  name?: string;
  email: string;
  role: "admin" | "editor";
  created_at?: string;
}
