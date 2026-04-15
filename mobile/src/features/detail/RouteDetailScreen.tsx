import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStaticMap } from './RouteStaticMap';
import { fetchPublishedRouteDetail } from './routeDetail.api';
import type { RouteDetail, RouteDetailSideQuest } from './routeDetail.types';
import type { RootStackParamList } from '../../navigation/Root';
import { useAppStore } from '../../store/useAppStore';
import { deriveRouteWarnings } from '../warnings/warningEngine';
import { RouteWarningsPanel } from '../warnings/RouteWarningsPanel';

type RouteDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RouteDetail'>;

function openGoogleMaps(sideQuest: RouteDetailSideQuest) {
  const query = `${sideQuest.latitude},${sideQuest.longitude}`;
  void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
}

function formatVehicleHeadline(label: string) {
  return label || 'Secili Garage profili yok';
}

export const RouteDetailScreen: React.FC<RouteDetailScreenProps> = ({ route }) => {
  const routeId = route.params.routeId;
  const vehicleProfiles = useAppStore((state) => state.vehicleProfiles);
  const selectedVehicleProfileId = useAppStore((state) => state.selectedVehicleProfileId);
  const routeSessions = useAppStore((state) => state.routeSessions);
  const startOrResumeRouteSession = useAppStore((state) => state.startOrResumeRouteSession);
  const updateRouteSessionPlanning = useAppStore((state) => state.updateRouteSessionPlanning);
  const setRouteSessionStatus = useAppStore((state) => state.setRouteSessionStatus);
  const stageCompletions = useAppStore((state) => state.stageCompletions);
  const toggleStageCompletion = useAppStore((state) => state.toggleStageCompletion);

  const [detail, setDetail] = useState<RouteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextDetail = await fetchPublishedRouteDetail(routeId);
      startTransition(() => {
        setDetail(nextDetail);
        setErrorMessage(null);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Route detail yuklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const selectedVehicleProfile = useMemo(
    () => vehicleProfiles.find((profile) => profile.id === selectedVehicleProfileId) ?? null,
    [selectedVehicleProfileId, vehicleProfiles]
  );

  const openRouteSession = useMemo(
    () =>
      routeSessions.find(
        (session) => session.routeId === routeId && (session.status === 'active' || session.status === 'incomplete')
      ) ?? null,
    [routeId, routeSessions]
  );

  const allSideQuests = useMemo(() => detail?.stages.flatMap((stage) => stage.sideQuests) ?? [], [detail]);
  const effectiveVehicleProfile = useMemo(() => {
    if (openRouteSession) {
      return vehicleProfiles.find((profile) => profile.id === openRouteSession.vehicleProfileId) ?? null;
    }

    return selectedVehicleProfile;
  }, [openRouteSession, selectedVehicleProfile, vehicleProfiles]);

  const selectedStageIds = openRouteSession?.selectedStageIds ?? [];
  const plannedSideQuestIds = openRouteSession?.plannedSideQuestIds ?? [];
  const scopedStages = useMemo(() => {
    if (!detail) {
      return [];
    }

    if (!openRouteSession) {
      return detail.stages;
    }

    return detail.stages.filter((stage) => selectedStageIds.includes(stage.id));
  }, [detail, openRouteSession, selectedStageIds]);

  const scopedSideQuests = useMemo(() => {
    if (!detail) {
      return [];
    }

    if (!openRouteSession) {
      return detail.stages.flatMap((stage) => stage.sideQuests);
    }

    return detail.stages
      .filter((stage) => selectedStageIds.includes(stage.id))
      .flatMap((stage) => stage.sideQuests.filter((sideQuest) => plannedSideQuestIds.includes(sideQuest.id)));
  }, [detail, openRouteSession, plannedSideQuestIds, selectedStageIds]);

  const warningSummary = useMemo(
    () =>
      deriveRouteWarnings({
        stages: scopedStages,
        sideQuests: scopedSideQuests,
        vehicleProfile: effectiveVehicleProfile,
      }),
    [effectiveVehicleProfile, scopedSideQuests, scopedStages]
  );
  const currentSessionCompletions = useMemo(
    () =>
      openRouteSession
        ? stageCompletions.filter((completion) => completion.routeSessionId === openRouteSession.id)
        : [],
    [openRouteSession, stageCompletions]
  );
  const completedStageIds = useMemo(
    () =>
      new Set(
        currentSessionCompletions
          .filter((completion) => completion.entityType === 'stage')
          .map((completion) => completion.entityId)
      ),
    [currentSessionCompletions]
  );
  const completedSideQuestIds = useMemo(
    () =>
      new Set(
        currentSessionCompletions
          .filter((completion) => completion.entityType === 'sideQuest')
          .map((completion) => completion.entityId)
      ),
    [currentSessionCompletions]
  );
  const canCompleteRoute = useMemo(
    () =>
      !!openRouteSession &&
      openRouteSession.selectedStageIds.every((stageId) => completedStageIds.has(stageId)) &&
      openRouteSession.selectedStageIds.length > 0,
    [completedStageIds, openRouteSession]
  );

  const toggleStage = (stageId: string) => {
    if (!detail || !openRouteSession) {
      return;
    }

    const stageAlreadySelected = openRouteSession.selectedStageIds.includes(stageId);
    const nextSelectedStageIds = stageAlreadySelected
      ? openRouteSession.selectedStageIds.filter((currentId) => currentId !== stageId)
      : [...openRouteSession.selectedStageIds, stageId];

    if (nextSelectedStageIds.length === 0) {
      Alert.alert('En az bir etap gerekli', 'RouteSession icinde en az bir etap secili kalmali.');
      return;
    }

    const allowedSideQuestIds = new Set(
      detail.stages
        .filter((stage) => nextSelectedStageIds.includes(stage.id))
        .flatMap((stage) => stage.sideQuests.map((sideQuest) => sideQuest.id))
    );

    updateRouteSessionPlanning(openRouteSession.id, {
      selectedStageIds: nextSelectedStageIds,
      plannedSideQuestIds: openRouteSession.plannedSideQuestIds.filter((sideQuestId) =>
        allowedSideQuestIds.has(sideQuestId)
      ),
    });
  };

  const toggleSideQuest = (stageId: string, sideQuestId: string) => {
    if (!openRouteSession) {
      return;
    }

    if (!openRouteSession.selectedStageIds.includes(stageId)) {
      Alert.alert('Etap secimi gerekli', 'Bu side questi planlamak icin once ilgili etabi session planina dahil et.');
      return;
    }

    const nextPlannedSideQuestIds = openRouteSession.plannedSideQuestIds.includes(sideQuestId)
      ? openRouteSession.plannedSideQuestIds.filter((currentId) => currentId !== sideQuestId)
      : [...openRouteSession.plannedSideQuestIds, sideQuestId];

    updateRouteSessionPlanning(openRouteSession.id, {
      selectedStageIds: openRouteSession.selectedStageIds,
      plannedSideQuestIds: nextPlannedSideQuestIds,
    });
  };

  const startSession = () => {
    if (!detail) {
      return;
    }

    if (!selectedVehicleProfile) {
      Alert.alert('Arac sec', 'RouteSession baslatmadan once Garage tabindan secili bir arac profili belirle.');
      return;
    }

    startOrResumeRouteSession({
      routeId: detail.id,
      routeCode: detail.code,
      routeName: detail.name,
      vehicleProfileId: selectedVehicleProfile.id,
      vehicleLabel: `${selectedVehicleProfile.brand} ${selectedVehicleProfile.model}`,
      routeDistanceKm: detail.plannedDistanceKm,
      selectedStageIds: detail.stages.map((stage) => stage.id),
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#E6A52B" />
          <Text style={styles.stateTitle}>Route detail yukleniyor</Text>
          <Text style={styles.stateBody}>R01 stage ve side quest hiyerarsisi okunuyor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Route detail baglanamadi</Text>
          <Text style={styles.stateBody}>{errorMessage ?? 'Published route detail bulunamadi.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{detail.code}</Text>
          <Text style={styles.title}>{detail.name}</Text>
          <Text style={styles.routeLine}>
            {detail.originLabel} - {detail.destinationLabel}
          </Text>
          <Text style={styles.summary}>{detail.summary}</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{detail.plannedDistanceKm.toLocaleString('tr-TR')}</Text>
              <Text style={styles.metricLabel}>toplam km</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{detail.plannedStageCount}</Text>
              <Text style={styles.metricLabel}>etap</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{allSideQuests.length}</Text>
              <Text style={styles.metricLabel}>side quest</Text>
            </View>
          </View>

          <View style={styles.regionWrap}>
            {detail.regionSet.map((region) => (
              <View key={region} style={styles.regionChip}>
                <Text style={styles.regionChipText}>{region}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sessionPanel}>
          <Text style={styles.sessionPanelTitle}>Companion oturumu</Text>
          {!selectedVehicleProfile && !openRouteSession ? (
            <Text style={styles.sessionPanelBody}>
              RouteSession baslatmak icin once Garage tabinda secili bir arac profili olustur.
            </Text>
          ) : (
            <>
              <Text style={styles.sessionPanelBody}>
                {openRouteSession
                  ? `Bu rota icin acik oturum var. Kullanilan profil: ${formatVehicleHeadline(openRouteSession.vehicleLabel)}`
                  : `Secili profil: ${formatVehicleHeadline(
                      `${selectedVehicleProfile?.brand ?? ''} ${selectedVehicleProfile?.model ?? ''}`.trim()
                    )}`}
              </Text>

              {openRouteSession ? (
                <>
                  <View style={styles.sessionSummaryRow}>
                    <View style={styles.sessionSummaryCard}>
                      <Text style={styles.sessionSummaryValue}>{selectedStageIds.length}</Text>
                      <Text style={styles.sessionSummaryLabel}>secili etap</Text>
                    </View>
                    <View style={styles.sessionSummaryCard}>
                      <Text style={styles.sessionSummaryValue}>{plannedSideQuestIds.length}</Text>
                      <Text style={styles.sessionSummaryLabel}>planli side quest</Text>
                    </View>
                  </View>

                  <View style={styles.sessionActionRow}>
                    <Pressable
                      onPress={() =>
                        setRouteSessionStatus(openRouteSession.id, openRouteSession.status === 'active' ? 'incomplete' : 'active')
                      }
                      style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.primaryButtonText}>
                        {openRouteSession.status === 'active' ? 'Ara ver' : 'Resume et'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (!canCompleteRoute) {
                          Alert.alert(
                            'Route tamamlanamaz',
                            'RouteSession tamamlanmadan once secili etaplarin tumunu manuel olarak tamamla.'
                          );
                          return;
                        }

                        setRouteSessionStatus(openRouteSession.id, 'completed');
                      }}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        !canCompleteRoute && styles.secondaryButtonDisabled,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.secondaryButtonText}>{canCompleteRoute ? 'Rotayi tamamla' : 'Tamamla'}</Text>
                    </Pressable>
                    {!canCompleteRoute ? (
                      <Text style={styles.sessionHint}>
                        Route tamamlamak icin secili etaplarin tumunu manuel olarak tamamla.
                      </Text>
                    ) : null}
                  </View>
                </>
              ) : (
                <Pressable onPress={startSession} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                  <Text style={styles.primaryButtonText}>Bu aracla oturum baslat</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        <RouteWarningsPanel
          generalWarnings={warningSummary.generalWarnings}
          vehicleWarnings={warningSummary.vehicleWarnings}
          hasVehicleProfile={effectiveVehicleProfile !== null}
        />

        <RouteStaticMap sideQuests={allSideQuests} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Etaplar</Text>
          <Text style={styles.sectionBody}>
            Ana guzergah sabit, side questler ise her etap altinda opsiyonel gorunur.
          </Text>
        </View>

        {detail.stages.map((stage) => {
          const stageIncluded = !openRouteSession || selectedStageIds.includes(stage.id);

          return (
            <View key={stage.id} style={[styles.stageCard, !stageIncluded && styles.stageCardMuted]}>
              <View style={styles.stageHeaderRow}>
                <View style={styles.stageBadge}>
                  <Text style={styles.stageBadgeText}>{stage.sequenceIndex}</Text>
                </View>
                <View style={styles.stageHeaderCopy}>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageRouteLine}>
                    {stage.originLabel} - {stage.destinationLabel}
                  </Text>
                </View>
                <Text style={styles.stageDistance}>{stage.distanceKm} km</Text>
              </View>

              <Text style={styles.stageSummary}>{stage.summary}</Text>

            {openRouteSession ? (
              <Pressable
                onPress={() => toggleStage(stage.id)}
                style={({ pressed }) => [styles.inlinePlannerButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.inlinePlannerButtonText}>
                    {stageIncluded ? 'Etabi session planindan cikar' : 'Etabi session planina ekle'}
                  </Text>
                </Pressable>
              ) : null}

              {openRouteSession && stageIncluded ? (
                <Pressable
                  onPress={() => toggleStageCompletion(openRouteSession.id, 'stage', stage.id)}
                  style={({ pressed }) => [
                    styles.inlineCompletionButton,
                    completedStageIds.has(stage.id) && styles.inlineCompletionButtonActive,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.inlineCompletionButtonText,
                      completedStageIds.has(stage.id) && styles.inlineCompletionButtonTextActive,
                    ]}
                  >
                    {completedStageIds.has(stage.id) ? 'Etap tamamlandi' : 'Etabi tamamla'}
                  </Text>
                </Pressable>
              ) : null}

              {!stageIncluded ? (
                <View style={styles.sideQuestEmpty}>
                  <Text style={styles.sideQuestEmptyText}>
                    Bu etap acik session planina dahil degil. Dahil etmeden side quest secilemez.
                  </Text>
                </View>
              ) : stage.sideQuests.length > 0 ? (
                <View style={styles.sideQuestList}>
                  {stage.sideQuests.map((sideQuest) => {
                    const isPlanned = plannedSideQuestIds.includes(sideQuest.id);

                    return (
                      <View key={sideQuest.id} style={styles.sideQuestCard}>
                        <View style={styles.sideQuestHeader}>
                          <Text style={styles.sideQuestName}>{sideQuest.name}</Text>
                          <Text style={styles.sideQuestMeta}>
                            {sideQuest.distanceKm} km · {sideQuest.type}
                          </Text>
                        </View>
                        <Text style={styles.sideQuestSummary}>{sideQuest.summary}</Text>

                        <View style={styles.sideQuestActions}>
                          <Pressable
                            onPress={() => openGoogleMaps(sideQuest)}
                            style={({ pressed }) => [styles.mapButton, pressed && styles.buttonPressed]}
                          >
                            <Text style={styles.mapButtonText}>Google Maps ile ac</Text>
                          </Pressable>

                          {openRouteSession ? (
                            <>
                              <Pressable
                                onPress={() => toggleSideQuest(stage.id, sideQuest.id)}
                                style={({ pressed }) => [
                                  styles.planButton,
                                  isPlanned && styles.planButtonActive,
                                  pressed && styles.buttonPressed,
                                ]}
                              >
                                <Text style={[styles.planButtonText, isPlanned && styles.planButtonTextActive]}>
                                  {isPlanned ? 'Planli' : 'Planla'}
                                </Text>
                              </Pressable>
                              <Pressable
                                onPress={() => toggleStageCompletion(openRouteSession.id, 'sideQuest', sideQuest.id)}
                                style={({ pressed }) => [
                                  styles.planButton,
                                  completedSideQuestIds.has(sideQuest.id) && styles.completionPillActive,
                                  pressed && styles.buttonPressed,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.planButtonText,
                                    completedSideQuestIds.has(sideQuest.id) && styles.planButtonTextActive,
                                  ]}
                                >
                                  {completedSideQuestIds.has(sideQuest.id) ? 'Tamamlandi' : 'Isaretle'}
                                </Text>
                              </Pressable>
                            </>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.sideQuestEmpty}>
                  <Text style={styles.sideQuestEmptyText}>Bu etapta side quest tanimli degil.</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1012',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  kicker: {
    color: '#E6A52B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F6F2E8',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 6,
  },
  routeLine: {
    color: '#CBCDD3',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 8,
  },
  summary: {
    color: '#A7A9B0',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#17171A',
    borderWidth: 1,
    borderColor: '#2A2C33',
    padding: 14,
  },
  metricValue: {
    color: '#F6F2E8',
    fontSize: 19,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#8B8D95',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  regionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  regionChip: {
    backgroundColor: '#1A1C20',
    borderWidth: 1,
    borderColor: '#30323A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  regionChipText: {
    color: '#CBCDD3',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 18,
  },
  sessionPanelTitle: {
    color: '#F6F2E8',
    fontSize: 20,
    fontWeight: '800',
  },
  sessionPanelBody: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  sessionSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  sessionSummaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3138',
    backgroundColor: '#1D1E23',
    padding: 14,
  },
  sessionSummaryValue: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
  sessionSummaryLabel: {
    color: '#8B8D95',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#E6A52B',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#111214',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#373A42',
    backgroundColor: '#202229',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  secondaryButtonDisabled: {
    opacity: 0.72,
  },
  secondaryButtonText: {
    color: '#F6F2E8',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionHint: {
    color: '#8B8D95',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F6F2E8',
    fontSize: 24,
    fontWeight: '800',
  },
  sectionBody: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  stageCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#15161A',
    borderWidth: 1,
    borderColor: '#2A2C33',
  },
  stageCardMuted: {
    opacity: 0.74,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6A52B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBadgeText: {
    color: '#111214',
    fontSize: 14,
    fontWeight: '900',
  },
  stageHeaderCopy: {
    flex: 1,
  },
  stageTitle: {
    color: '#F6F2E8',
    fontSize: 19,
    fontWeight: '800',
  },
  stageRouteLine: {
    color: '#8B8D95',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  stageDistance: {
    color: '#E6A52B',
    fontSize: 14,
    fontWeight: '800',
  },
  stageSummary: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  inlinePlannerButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  inlinePlannerButtonText: {
    color: '#F8D47B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineCompletionButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3A3D45',
    backgroundColor: '#1C1D22',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineCompletionButtonActive: {
    borderColor: '#4B6A47',
    backgroundColor: '#182118',
  },
  inlineCompletionButtonText: {
    color: '#CBD0D8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineCompletionButtonTextActive: {
    color: '#9DDB95',
  },
  sideQuestList: {
    marginTop: 16,
    gap: 10,
  },
  sideQuestCard: {
    borderRadius: 16,
    backgroundColor: '#1A1B20',
    borderWidth: 1,
    borderColor: '#2F3138',
    padding: 14,
  },
  sideQuestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  sideQuestName: {
    flex: 1,
    color: '#F6F2E8',
    fontSize: 15,
    fontWeight: '800',
  },
  sideQuestMeta: {
    color: '#E6A52B',
    fontSize: 12,
    fontWeight: '700',
  },
  sideQuestSummary: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  sideQuestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  mapButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#373A42',
    backgroundColor: '#202229',
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#F6F2E8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4B4F58',
    backgroundColor: '#191B20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planButtonActive: {
    borderColor: '#E6A52B',
    backgroundColor: '#2B2517',
  },
  completionPillActive: {
    borderColor: '#4B6A47',
    backgroundColor: '#182118',
  },
  planButtonText: {
    color: '#CBD0D8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planButtonTextActive: {
    color: '#F8D47B',
  },
  sideQuestEmpty: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#1A1B20',
    borderWidth: 1,
    borderColor: '#2F3138',
  },
  sideQuestEmptyText: {
    color: '#8B8D95',
    fontSize: 13,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  stateTitle: {
    color: '#F6F2E8',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateBody: {
    color: '#A7A9B0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
