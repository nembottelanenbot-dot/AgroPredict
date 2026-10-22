export type Role =
  | 'agriculteur'
  | 'chef_cooperative'
  | 'agent_terrain'
  | 'analyste'
  | 'admin_regional'
  | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  region?: string | null;
  cooperative_id?: number | null;
  active?: number;
  created_at?: string;
}

export interface Crop {
  id: number;
  parcel_id: number;
  crop_type: string;
  variety?: string | null;
  sowing_date?: string | null;
  stage?: string | null;
  status?: string | null;
}

export interface Parcel {
  id: number;
  user_id: number;
  name: string;
  lat: number;
  lon: number;
  area_ha: number;
  soil_type?: string | null;
  irrigation?: string | null;
  region?: string | null;
  crops?: Crop[];
  owner_name?: string | null;
}

export interface Prediction {
  crop_id: number;
  crop_type: string;
  unit: string;
  group: string;
  stage?: string;
  yield_med: number;
  confidence_80: { low: number; high: number };
  confidence_95: { low: number; high: number };
  scenarios: { optimiste: number; median: number; pessimiste: number };
  predictions: HorizonPrediction[];
  factors: Record<string, number>;
  recommendation: string[];
  historical: { local_avg: number; national_ref: number; last_campaign: number };
  mape: number;
}

export interface HorizonPrediction {
  horizon_days: number;
  horizon_label: string;
  yield_med: number;
  yield_min: number;
  yield_max: number;
  confidence_80_low: number;
  confidence_80_high: number;
  confidence_95_low: number;
  confidence_95_high: number;
  scenario_opt: number;
  scenario_med: number;
  scenario_pes: number;
}

export interface WeatherDay {
  date: string;
  day: string;
  temp_min: number;
  temp_max: number;
  temp_avg: number;
  precipitation: number;
  humidity: number;
  wind: number;
  uv: number;
  risk_frost: string;
  icon: string;
}

export interface Alert {
  id: number;
  user_id: number;
  parcel_id?: number | null;
  type: string;
  severity: string;
  message: string;
  recommendation: string;
  status: string;
  triggered_at: string;
  parcel_name?: string | null;
}

export interface Report {
  id: number;
  user_id: number;
  type: string;
  format: string;
  generated_at: string;
}

export interface MlModel {
  id: number;
  crop_type: string;
  algorithm: string;
  version: string;
  mape: number;
  rmse: number;
  r2: number;
  is_active: number;
  trained_at: string;
}

export interface DashboardStats {
  parcels_count: number;
  crops_count: number;
  total_area: number;
  active_alerts: number;
  estimated_production: number;
  crops: (Prediction & { parcel_name: string; region: string; area_ha: number })[];
}

export interface RegionalStat {
  region: string;
  parcels: number;
  area: number;
  crops: Record<string, number>;
  production: number;
  risk: string;
}
