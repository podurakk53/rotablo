export type VehicleBodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible';
export type VehicleDrivetrain = 'fwd' | 'rwd' | 'awd' | '4wd';
export type GroundClearanceClass = 'low' | 'medium' | 'high';
export type TireSeason = 'summer' | 'allSeason' | 'winter';
export type VehicleProfileSource = 'reference' | 'manual';

export interface VehicleProfileRecord {
  id: string;
  brand: string;
  model: string;
  modelYear: number | null;
  bodyType: VehicleBodyType;
  drivetrain: VehicleDrivetrain;
  groundClearanceClass: GroundClearanceClass;
  tireSeason: TireSeason;
  referenceVehicleKey: string | null;
  source: VehicleProfileSource;
  isPrimary: boolean;
}

export interface VehicleProfileInput {
  id?: string;
  brand: string;
  model: string;
  modelYear: number | null;
  bodyType: VehicleBodyType;
  drivetrain: VehicleDrivetrain;
  groundClearanceClass: GroundClearanceClass;
  tireSeason: TireSeason;
  referenceVehicleKey: string | null;
  source: VehicleProfileSource;
}

export interface VehicleReferenceRecord {
  key: string;
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  bodyType: VehicleBodyType;
  drivetrain: VehicleDrivetrain;
  groundClearanceClass: GroundClearanceClass;
}
