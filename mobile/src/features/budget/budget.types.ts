export type LodgingTier = 'budget' | 'comfort' | 'premium';

export interface BudgetScenarioRecord {
  id: string;
  routeSessionId: string;
  name: string;
  fuelPriceTlPerLiter: number;
  consumptionLitersPer100Km: number;
  lodgingTier: LodgingTier;
  lodgingDailyTl: number;
  foodDailyTl: number;
  currency: 'TRY';
}

export interface BudgetScenarioInput {
  routeSessionId: string;
  name: string;
  fuelPriceTlPerLiter: number;
  consumptionLitersPer100Km: number;
  lodgingTier: LodgingTier;
  lodgingDailyTl: number;
  foodDailyTl: number;
}
