import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

type RouteDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RouteDetail'>;

function openGoogleMaps(sideQuest: RouteDetailSideQuest) {
  const query = `${sideQuest.latitude},${sideQuest.longitude}`;
  void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
}

export const RouteDetailScreen: React.FC<RouteDetailScreenProps> = ({ route }) => {
  const routeId = route.params.routeId;
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

  const allSideQuests = useMemo(
    () => detail?.stages.flatMap((stage) => stage.sideQuests) ?? [],
    [detail]
  );

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

        <RouteStaticMap sideQuests={allSideQuests} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Etaplar</Text>
          <Text style={styles.sectionBody}>
            Ana guzergah sabit, side questler ise her etap altinda opsiyonel gorunur.
          </Text>
        </View>

        {detail.stages.map((stage) => (
          <View key={stage.id} style={styles.stageCard}>
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

            {stage.sideQuests.length > 0 ? (
              <View style={styles.sideQuestList}>
                {stage.sideQuests.map((sideQuest) => (
                  <Pressable
                    key={sideQuest.id}
                    onPress={() => openGoogleMaps(sideQuest)}
                    style={({ pressed }) => [styles.sideQuestCard, pressed && styles.sideQuestCardPressed]}
                  >
                    <View style={styles.sideQuestHeader}>
                      <Text style={styles.sideQuestName}>{sideQuest.name}</Text>
                      <Text style={styles.sideQuestMeta}>
                        {sideQuest.distanceKm} km • {sideQuest.type}
                      </Text>
                    </View>
                    <Text style={styles.sideQuestSummary}>{sideQuest.summary}</Text>
                    <Text style={styles.sideQuestAction}>Google Maps ile ac</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.sideQuestEmpty}>
                <Text style={styles.sideQuestEmptyText}>Bu etapta side quest tanimli degil.</Text>
              </View>
            )}
          </View>
        ))}
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
  sideQuestCardPressed: {
    opacity: 0.92,
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
  sideQuestAction: {
    color: '#CBCDD3',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
