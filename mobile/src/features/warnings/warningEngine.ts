import type { RouteDetailSideQuest, RouteDetailStage } from '../detail/routeDetail.types';
import type { VehicleProfileRecord } from '../vehicles/vehicle.types';
import type { WarningItem, WarningSeverity } from './warning.types';

type WarningSource = {
  type: 'stage' | 'sideQuest';
  name: string;
};

type AggregatedTraits = {
  lowClearanceRisk: boolean;
  roughSurfaceRisk: boolean;
  highAltitudeRisk: boolean;
  narrowRoadRisk: boolean;
  steepGradeRisk: boolean;
  hairpinDensity: 'low' | 'medium' | 'high';
  rainSensitive: boolean;
  fogSensitive: boolean;
  snowSensitive: boolean;
  remoteAccessRisk: boolean;
  fatigueLoad: 'low' | 'medium' | 'high';
};

type RouteWarningsInput = {
  stages: RouteDetailStage[];
  sideQuests: RouteDetailSideQuest[];
  vehicleProfile: VehicleProfileRecord | null;
};

const severityRank: Record<WarningSeverity, number> = {
  high: 3,
  caution: 2,
  info: 1,
};

function maxDensity(left: AggregatedTraits['hairpinDensity'], right: AggregatedTraits['hairpinDensity']) {
  if (left === 'high' || right === 'high') {
    return 'high';
  }

  if (left === 'medium' || right === 'medium') {
    return 'medium';
  }

  return 'low';
}

function aggregateTraits(stages: RouteDetailStage[], sideQuests: RouteDetailSideQuest[]): AggregatedTraits {
  const seed: AggregatedTraits = {
    lowClearanceRisk: false,
    roughSurfaceRisk: false,
    highAltitudeRisk: false,
    narrowRoadRisk: false,
    steepGradeRisk: false,
    hairpinDensity: 'low',
    rainSensitive: false,
    fogSensitive: false,
    snowSensitive: false,
    remoteAccessRisk: false,
    fatigueLoad: 'low',
  };

  [...stages.map((stage) => stage.hazard), ...sideQuests.map((sideQuest) => sideQuest.hazard)].forEach((hazard) => {
    seed.lowClearanceRisk = seed.lowClearanceRisk || hazard.lowClearanceRisk;
    seed.roughSurfaceRisk = seed.roughSurfaceRisk || hazard.roughSurfaceRisk;
    seed.highAltitudeRisk = seed.highAltitudeRisk || hazard.highAltitudeRisk;
    seed.narrowRoadRisk = seed.narrowRoadRisk || hazard.narrowRoadRisk;
    seed.steepGradeRisk = seed.steepGradeRisk || hazard.steepGradeRisk;
    seed.hairpinDensity = maxDensity(seed.hairpinDensity, hazard.hairpinDensity);
    seed.rainSensitive = seed.rainSensitive || hazard.rainSensitive;
    seed.fogSensitive = seed.fogSensitive || hazard.fogSensitive;
    seed.snowSensitive = seed.snowSensitive || hazard.snowSensitive;
    seed.remoteAccessRisk = seed.remoteAccessRisk || hazard.remoteAccessRisk;
    seed.fatigueLoad = maxDensity(seed.fatigueLoad, hazard.fatigueLoad);
  });

  return seed;
}

function findSources(
  stages: RouteDetailStage[],
  sideQuests: RouteDetailSideQuest[],
  predicate: (item: AggregatedTraits) => boolean
) {
  const stageSources: WarningSource[] = stages
    .filter((stage) => predicate(stage.hazard))
    .map((stage) => ({ type: 'stage', name: stage.title }));
  const sideQuestSources: WarningSource[] = sideQuests
    .filter((sideQuest) => predicate(sideQuest.hazard))
    .map((sideQuest) => ({ type: 'sideQuest', name: sideQuest.name }));

  return [...stageSources, ...sideQuestSources];
}

function formatSourceSummary(sources: WarningSource[]) {
  const stageCount = sources.filter((source) => source.type === 'stage').length;
  const sideQuestCount = sources.filter((source) => source.type === 'sideQuest').length;
  const parts: string[] = [];

  if (stageCount > 0) {
    parts.push(`${stageCount} etap`);
  }

  if (sideQuestCount > 0) {
    parts.push(`${sideQuestCount} side quest`);
  }

  return parts.length > 0 ? `Kaynak: ${parts.join(' + ')}` : 'Kaynak: rota geneli';
}

function sortWarnings(items: WarningItem[]) {
  return [...items].sort((left, right) => {
    const severityDelta = severityRank[right.severity] - severityRank[left.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return left.ruleCode.localeCompare(right.ruleCode);
  });
}

export function deriveRouteWarnings(input: RouteWarningsInput) {
  const aggregated = aggregateTraits(input.stages, input.sideQuests);
  const generalWarnings: WarningItem[] = [];
  const vehicleWarnings: WarningItem[] = [];

  if (aggregated.roughSurfaceRisk) {
    const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.roughSurfaceRisk);
    generalWarnings.push({
      ruleCode: 'ROAD_001',
      category: 'general',
      severity: 'caution',
      message: 'Bu rotada yer yer rough surface karakterli bolumler bulunur.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.narrowRoadRisk) {
    const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.narrowRoadRisk);
    generalWarnings.push({
      ruleCode: 'ROAD_002',
      category: 'general',
      severity: 'caution',
      message: 'Bu rotada dar yol karakteri gosteren bolumler bulunur.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.steepGradeRisk && aggregated.hairpinDensity === 'high') {
    const sources = findSources(
      input.stages,
      input.sideQuests,
      (hazard) => hazard.steepGradeRisk || hazard.hairpinDensity === 'high'
    );
    generalWarnings.push({
      ruleCode: 'ROAD_003',
      category: 'general',
      severity: 'high',
      message: 'Bu rotada egimli ve virajli bolumler surusu yorucu hale getirebilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.highAltitudeRisk && aggregated.fogSensitive) {
    const sources = findSources(
      input.stages,
      input.sideQuests,
      (hazard) => hazard.highAltitudeRisk || hazard.fogSensitive
    );
    generalWarnings.push({
      ruleCode: 'ROAD_004',
      category: 'general',
      severity: 'caution',
      message: 'Yuksek rakimli bolumlerde sisli kosullarda gorus zorlasabilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.highAltitudeRisk && aggregated.snowSensitive) {
    const sources = findSources(
      input.stages,
      input.sideQuests,
      (hazard) => hazard.highAltitudeRisk || hazard.snowSensitive
    );
    generalWarnings.push({
      ruleCode: 'ROAD_005',
      category: 'general',
      severity: 'high',
      message: 'Yuksek rakimli bolumler soguk veya karli kosullarda daha zorlayici olabilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.rainSensitive && (aggregated.steepGradeRisk || aggregated.hairpinDensity === 'high')) {
    const sources = findSources(
      input.stages,
      input.sideQuests,
      (hazard) => hazard.rainSensitive || hazard.steepGradeRisk || hazard.hairpinDensity === 'high'
    );
    generalWarnings.push({
      ruleCode: 'ROAD_006',
      category: 'general',
      severity: 'caution',
      message: 'Yagisli havalarda virajli ve egimli bolumler daha dikkatli surus gerektirebilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.remoteAccessRisk) {
    const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.remoteAccessRisk);
    generalWarnings.push({
      ruleCode: 'ROAD_007',
      category: 'general',
      severity: 'info',
      message: 'Bu rotada servis veya destek noktalari seyrek olabilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (aggregated.fatigueLoad === 'high') {
    const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.fatigueLoad === 'high');
    generalWarnings.push({
      ruleCode: 'ROAD_008',
      category: 'general',
      severity: 'caution',
      message: 'Bu rota uzun veya yorucu surus hissi yaratabilir.',
      sourceSummary: formatSourceSummary(sources),
    });
  }

  if (input.vehicleProfile) {
    if (
      input.vehicleProfile.groundClearanceClass === 'low' &&
      (aggregated.lowClearanceRisk || aggregated.roughSurfaceRisk)
    ) {
      const sources = findSources(
        input.stages,
        input.sideQuests,
        (hazard) => hazard.lowClearanceRisk || hazard.roughSurfaceRisk
      );
      vehicleWarnings.push({
        ruleCode: 'VEH_001',
        category: 'vehicle',
        severity: 'high',
        message: 'Dusuk araclar icin alt takim riski artabilir.',
        sourceSummary: formatSourceSummary(sources),
      });
    }

    if (input.vehicleProfile.drivetrain === 'rwd' && aggregated.hairpinDensity === 'high') {
      const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.hairpinDensity === 'high');
      vehicleWarnings.push({
        ruleCode: 'VEH_002',
        category: 'vehicle',
        severity: 'caution',
        message: 'Viraj yogunlugu bu arac duzeniyle daha dikkatli surus gerektirebilir.',
        sourceSummary: formatSourceSummary(sources),
      });
    }

    if (input.vehicleProfile.tireSeason === 'summer' && aggregated.rainSensitive) {
      const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.rainSensitive);
      vehicleWarnings.push({
        ruleCode: 'VEH_003',
        category: 'vehicle',
        severity: 'caution',
        message: 'Bu rota yagisli kosullarda yaz lastigi ile daha dikkatli surus gerektirebilir.',
        sourceSummary: formatSourceSummary(sources),
      });
    }

    if (input.vehicleProfile.tireSeason === 'summer' && aggregated.snowSensitive) {
      const sources = findSources(input.stages, input.sideQuests, (hazard) => hazard.snowSensitive);
      vehicleWarnings.push({
        ruleCode: 'VEH_004',
        category: 'vehicle',
        severity: 'high',
        message: 'Bu rota karli veya cok soguk kosullarda yaz lastigi ile zorlayici olabilir.',
        sourceSummary: formatSourceSummary(sources),
      });
    }
  }

  return {
    generalWarnings: sortWarnings(generalWarnings),
    vehicleWarnings: sortWarnings(vehicleWarnings),
  };
}
