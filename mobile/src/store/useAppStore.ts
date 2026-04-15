import { create } from 'zustand';
import type { BudgetScenarioInput, BudgetScenarioRecord } from '../features/budget/budget.types';
import type { StageCompletionRecord } from '../features/completion/completion.types';
import type { RouteSessionInput, RouteSessionRecord, RouteSessionStatus } from '../features/sessions/routeSession.types';
import type { VehicleProfileInput, VehicleProfileRecord } from '../features/vehicles/vehicle.types';

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  activeRouteSessionId: string | null;
  pendingCompletionIds: string[];
  vehicleProfiles: VehicleProfileRecord[];
  selectedVehicleProfileId: string | null;
  routeSessions: RouteSessionRecord[];
  stageCompletions: StageCompletionRecord[];
  budgetScenarios: BudgetScenarioRecord[];
  completeOnboarding: () => void;
  queueCompletion: (entityId: string) => void;
  clearCompletionQueue: () => void;
  upsertVehicleProfile: (input: VehicleProfileInput) => string;
  selectVehicleProfile: (vehicleProfileId: string) => void;
  startOrResumeRouteSession: (input: RouteSessionInput) => string;
  updateRouteSessionPlanning: (
    routeSessionId: string,
    planning: { selectedStageIds: string[]; plannedSideQuestIds: string[] }
  ) => void;
  setRouteSessionStatus: (routeSessionId: string, status: RouteSessionStatus) => void;
  toggleStageCompletion: (routeSessionId: string, entityType: 'stage' | 'sideQuest', entityId: string) => void;
  upsertBudgetScenario: (input: BudgetScenarioInput) => string;
}

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  activeRouteSessionId: null,
  pendingCompletionIds: [],
  vehicleProfiles: [],
  selectedVehicleProfileId: null,
  routeSessions: [],
  stageCompletions: [],
  budgetScenarios: [],

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  queueCompletion: (entityId: string) =>
    set((state) => ({
      pendingCompletionIds: [...state.pendingCompletionIds, entityId],
    })),

  clearCompletionQueue: () => set({ pendingCompletionIds: [] }),

  upsertVehicleProfile: (input) => {
    const vehicleProfileId = input.id ?? createLocalId('vehicle');

    set((state) => {
      const exists = state.vehicleProfiles.some((profile) => profile.id === vehicleProfileId);
      const shouldBecomePrimary = exists
        ? state.selectedVehicleProfileId === vehicleProfileId
        : state.selectedVehicleProfileId === null;

      const nextProfile: VehicleProfileRecord = {
        id: vehicleProfileId,
        brand: input.brand,
        model: input.model,
        modelYear: input.modelYear,
        bodyType: input.bodyType,
        drivetrain: input.drivetrain,
        groundClearanceClass: input.groundClearanceClass,
        tireSeason: input.tireSeason,
        referenceVehicleKey: input.referenceVehicleKey,
        source: input.source,
        isPrimary: shouldBecomePrimary,
      };

      const nextProfiles = exists
        ? state.vehicleProfiles.map((profile) =>
            profile.id === vehicleProfileId
              ? nextProfile
              : {
                  ...profile,
                  isPrimary: shouldBecomePrimary ? false : profile.isPrimary,
                }
          )
        : [
            ...state.vehicleProfiles.map((profile) => ({
              ...profile,
              isPrimary: shouldBecomePrimary ? false : profile.isPrimary,
            })),
            nextProfile,
          ];

      return {
        vehicleProfiles: nextProfiles,
        selectedVehicleProfileId: shouldBecomePrimary ? vehicleProfileId : state.selectedVehicleProfileId,
      };
    });

    return vehicleProfileId;
  },

  selectVehicleProfile: (vehicleProfileId) =>
    set((state) => ({
      selectedVehicleProfileId: vehicleProfileId,
      vehicleProfiles: state.vehicleProfiles.map((profile) => ({
        ...profile,
        isPrimary: profile.id === vehicleProfileId,
      })),
    })),

  startOrResumeRouteSession: (input) => {
    let resolvedRouteSessionId = createLocalId('session');

    set((state) => {
      const openSession = state.routeSessions.find(
        (session) =>
          session.routeId === input.routeId && (session.status === 'active' || session.status === 'incomplete')
      );

      if (openSession) {
        resolvedRouteSessionId = openSession.id;

        return {
          activeRouteSessionId: openSession.id,
          routeSessions: state.routeSessions.map((session) =>
            session.id === openSession.id
              ? {
                  ...session,
                  status: 'active',
                  updatedAt: nowIso(),
                }
              : session
          ),
        };
      }

      const nextSession: RouteSessionRecord = {
        id: resolvedRouteSessionId,
        routeId: input.routeId,
        routeCode: input.routeCode,
        routeName: input.routeName,
        routeDistanceKm: input.routeDistanceKm,
        vehicleProfileId: input.vehicleProfileId,
        vehicleLabel: input.vehicleLabel,
        budgetScenarioId: null,
        status: 'active',
        selectedStageIds: input.selectedStageIds,
        plannedSideQuestIds: [],
        startedAt: nowIso(),
        updatedAt: nowIso(),
        completedAt: null,
      };

      return {
        activeRouteSessionId: resolvedRouteSessionId,
        routeSessions: [...state.routeSessions, nextSession],
      };
    });

    return resolvedRouteSessionId;
  },

  updateRouteSessionPlanning: (routeSessionId, planning) =>
    set((state) => ({
      routeSessions: state.routeSessions.map((session) =>
        session.id === routeSessionId
          ? {
              ...session,
              selectedStageIds: planning.selectedStageIds,
              plannedSideQuestIds: planning.plannedSideQuestIds,
              updatedAt: nowIso(),
            }
          : session
      ),
    })),

  setRouteSessionStatus: (routeSessionId, status) =>
    set((state) => ({
      activeRouteSessionId:
        status === 'active' ? routeSessionId : state.activeRouteSessionId === routeSessionId ? null : state.activeRouteSessionId,
      routeSessions: state.routeSessions.map((session) =>
        session.id === routeSessionId
          ? {
              ...session,
              status,
              updatedAt: nowIso(),
              completedAt: status === 'completed' ? nowIso() : null,
            }
          : session
      ),
    })),

  toggleStageCompletion: (routeSessionId, entityType, entityId) =>
    set((state) => {
      const existing = state.stageCompletions.find(
        (completion) =>
          completion.routeSessionId === routeSessionId &&
          completion.entityType === entityType &&
          completion.entityId === entityId
      );

      if (existing) {
        return {
          stageCompletions: state.stageCompletions.filter((completion) => completion.id !== existing.id),
        };
      }

      return {
        stageCompletions: [
          ...state.stageCompletions,
          {
            id: createLocalId('completion'),
            routeSessionId,
            entityType,
            entityId,
            completionSource: 'manual',
            completedAt: nowIso(),
          },
        ],
      };
    }),

  upsertBudgetScenario: (input) => {
    const generatedId = createLocalId('budget');
    let resolvedScenarioId = generatedId;

    set((state) => {
      const existing = state.budgetScenarios.find((scenario) => scenario.routeSessionId === input.routeSessionId);
      const nextScenarioId = existing?.id ?? generatedId;
      resolvedScenarioId = nextScenarioId;
      const nextScenario: BudgetScenarioRecord = {
        id: nextScenarioId,
        routeSessionId: input.routeSessionId,
        name: input.name,
        fuelPriceTlPerLiter: input.fuelPriceTlPerLiter,
        consumptionLitersPer100Km: input.consumptionLitersPer100Km,
        lodgingTier: input.lodgingTier,
        lodgingDailyTl: input.lodgingDailyTl,
        foodDailyTl: input.foodDailyTl,
        currency: 'TRY',
      };

      return {
        budgetScenarios: existing
          ? state.budgetScenarios.map((scenario) => (scenario.id === existing.id ? nextScenario : scenario))
          : [...state.budgetScenarios, nextScenario],
        routeSessions: state.routeSessions.map((session) =>
          session.id === input.routeSessionId ? { ...session, budgetScenarioId: nextScenarioId, updatedAt: nowIso() } : session
        ),
      };
    });

    return resolvedScenarioId;
  },
}));
