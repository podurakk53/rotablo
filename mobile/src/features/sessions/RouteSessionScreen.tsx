import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../navigation/Root';
import type { BudgetScenarioRecord, LodgingTier } from '../budget/budget.types';

function formatStatusLabel(status: 'active' | 'incomplete' | 'completed') {
  if (status === 'active') {
    return 'Aktif';
  }

  if (status === 'incomplete') {
    return 'Ara verildi';
  }

  return 'Tamamlandi';
}

function estimateBudget(routeDistanceKm: number, scenario: BudgetScenarioRecord | null) {
  if (!scenario) {
    return null;
  }

  const estimatedDays = Math.max(1, Math.ceil(routeDistanceKm / 450));
  const fuelCost = (routeDistanceKm / 100) * scenario.consumptionLitersPer100Km * scenario.fuelPriceTlPerLiter;
  const lodgingCost = estimatedDays * scenario.lodgingDailyTl;
  const foodCost = estimatedDays * scenario.foodDailyTl;

  return {
    estimatedDays,
    fuelCost,
    lodgingCost,
    foodCost,
    totalCost: fuelCost + lodgingCost + foodCost,
  };
}

type BudgetEditorProps = {
  routeSessionId: string;
  routeDistanceKm: number;
  existingScenario: BudgetScenarioRecord | null;
  onSave: (input: {
    routeSessionId: string;
    name: string;
    fuelPriceTlPerLiter: number;
    consumptionLitersPer100Km: number;
    lodgingTier: LodgingTier;
    lodgingDailyTl: number;
    foodDailyTl: number;
  }) => void;
};

const LODGING_TIERS: LodgingTier[] = ['budget', 'comfort', 'premium'];

function BudgetEditor({ routeSessionId, routeDistanceKm, existingScenario, onSave }: BudgetEditorProps) {
  const [name, setName] = useState(existingScenario?.name ?? 'Varsayilan Senaryo');
  const [fuelPrice, setFuelPrice] = useState(existingScenario?.fuelPriceTlPerLiter.toString() ?? '45');
  const [consumption, setConsumption] = useState(
    existingScenario?.consumptionLitersPer100Km.toString() ?? '8.5'
  );
  const [lodgingTier, setLodgingTier] = useState<LodgingTier>(existingScenario?.lodgingTier ?? 'comfort');
  const [lodgingDaily, setLodgingDaily] = useState(existingScenario?.lodgingDailyTl.toString() ?? '3500');
  const [foodDaily, setFoodDaily] = useState(existingScenario?.foodDailyTl.toString() ?? '1200');

  useEffect(() => {
    if (!existingScenario) {
      return;
    }

    setName(existingScenario.name);
    setFuelPrice(existingScenario.fuelPriceTlPerLiter.toString());
    setConsumption(existingScenario.consumptionLitersPer100Km.toString());
    setLodgingTier(existingScenario.lodgingTier);
    setLodgingDaily(existingScenario.lodgingDailyTl.toString());
    setFoodDaily(existingScenario.foodDailyTl.toString());
  }, [existingScenario]);

  const previewScenario = useMemo(
    () =>
      estimateBudget(routeDistanceKm, {
        id: existingScenario?.id ?? 'preview',
        routeSessionId,
        name,
        fuelPriceTlPerLiter: Number(fuelPrice) || 0,
        consumptionLitersPer100Km: Number(consumption) || 0,
        lodgingTier,
        lodgingDailyTl: Number(lodgingDaily) || 0,
        foodDailyTl: Number(foodDaily) || 0,
        currency: 'TRY',
      }),
    [consumption, existingScenario?.id, foodDaily, fuelPrice, lodgingDaily, lodgingTier, name, routeDistanceKm, routeSessionId]
  );

  return (
    <View style={styles.budgetCard}>
      <Text style={styles.budgetTitle}>Butce senaryosu</Text>
      <Text style={styles.budgetBody}>Yaklasik masraf, route ana km'si uzerinden hesaplanir.</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Senaryo adi"
        placeholderTextColor="#72757D"
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={fuelPrice}
          onChangeText={setFuelPrice}
          keyboardType="decimal-pad"
          placeholder="TL/L"
          placeholderTextColor="#72757D"
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={consumption}
          onChangeText={setConsumption}
          keyboardType="decimal-pad"
          placeholder="L/100 km"
          placeholderTextColor="#72757D"
        />
      </View>

      <View style={styles.tierWrap}>
        {LODGING_TIERS.map((tier) => {
          const selected = tier === lodgingTier;

          return (
            <Pressable
              key={tier}
              onPress={() => setLodgingTier(tier)}
              style={({ pressed }) => [
                styles.tierChip,
                selected && styles.tierChipSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.tierChipText, selected && styles.tierChipTextSelected]}>{tier}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={lodgingDaily}
          onChangeText={setLodgingDaily}
          keyboardType="number-pad"
          placeholder="Konaklama / gun"
          placeholderTextColor="#72757D"
        />
        <TextInput
          style={[styles.input, styles.inputHalf]}
          value={foodDaily}
          onChangeText={setFoodDaily}
          keyboardType="number-pad"
          placeholder="Yeme icme / gun"
          placeholderTextColor="#72757D"
        />
      </View>

      {previewScenario ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{previewScenario.estimatedDays} gun varsayim</Text>
          <Text style={styles.previewLine}>Yakit: {previewScenario.fuelCost.toFixed(0)} TL</Text>
          <Text style={styles.previewLine}>Konaklama: {previewScenario.lodgingCost.toFixed(0)} TL</Text>
          <Text style={styles.previewLine}>Yeme icme: {previewScenario.foodCost.toFixed(0)} TL</Text>
          <Text style={styles.previewTotal}>Toplam: {previewScenario.totalCost.toFixed(0)} TL</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() =>
          onSave({
            routeSessionId,
            name,
            fuelPriceTlPerLiter: Number(fuelPrice) || 0,
            consumptionLitersPer100Km: Number(consumption) || 0,
            lodgingTier,
            lodgingDailyTl: Number(lodgingDaily) || 0,
            foodDailyTl: Number(foodDaily) || 0,
          })
        }
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
      >
        <Text style={styles.primaryButtonText}>{existingScenario ? 'Butceyi guncelle' : 'Butceyi kaydet'}</Text>
      </Pressable>
    </View>
  );
}

export const RouteSessionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const routeSessions = useAppStore((state) => state.routeSessions);
  const activeRouteSessionId = useAppStore((state) => state.activeRouteSessionId);
  const setRouteSessionStatus = useAppStore((state) => state.setRouteSessionStatus);
  const stageCompletions = useAppStore((state) => state.stageCompletions);
  const budgetScenarios = useAppStore((state) => state.budgetScenarios);
  const upsertBudgetScenario = useAppStore((state) => state.upsertBudgetScenario);

  const sortedSessions = [...routeSessions].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Route Session</Text>
          <Text style={styles.title}>Oturumlar</Text>
          <Text style={styles.body}>
            T13 ve T14 ile manual completion ve butce senaryosu da session akisina eklendi.
          </Text>
        </View>

        {sortedSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Henuz oturum yok</Text>
            <Text style={styles.emptyBody}>
              Published bir rota acip secili Garage profili ile oturum baslattiginda burasi dolacak.
            </Text>
          </View>
        ) : (
          sortedSessions.map((session) => {
            const isFocused = activeRouteSessionId === session.id;
            const sessionCompletions = stageCompletions.filter(
              (completion) => completion.routeSessionId === session.id
            );
            const completedStageIds = new Set(
              sessionCompletions
                .filter((completion) => completion.entityType === 'stage')
                .map((completion) => completion.entityId)
            );
            const completedSideQuestCount = sessionCompletions.filter(
              (completion) => completion.entityType === 'sideQuest'
            ).length;
            const canCompleteRoute =
              session.selectedStageIds.length > 0 &&
              session.selectedStageIds.every((stageId) => completedStageIds.has(stageId));
            const scenario =
              budgetScenarios.find((budgetScenario) => budgetScenario.routeSessionId === session.id) ?? null;
            const budgetEstimate = estimateBudget(session.routeDistanceKm, scenario);

            return (
              <View key={session.id} style={[styles.sessionCard, isFocused && styles.sessionCardFocused]}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionHeaderCopy}>
                    <Text style={styles.sessionCode}>{session.routeCode}</Text>
                    <Text style={styles.sessionTitle}>{session.routeName}</Text>
                    <Text style={styles.sessionMeta}>{session.vehicleLabel}</Text>
                  </View>
                  <View style={[styles.statusBadge, session.status === 'completed' && styles.statusBadgeCompleted]}>
                    <Text style={styles.statusBadgeText}>{formatStatusLabel(session.status)}</Text>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{session.selectedStageIds.length}</Text>
                    <Text style={styles.metricLabel}>secili etap</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{session.plannedSideQuestIds.length}</Text>
                    <Text style={styles.metricLabel}>planli side quest</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{completedStageIds.size}</Text>
                    <Text style={styles.metricLabel}>tamamlanan etap</Text>
                  </View>
                </View>

                <View style={styles.completionSummary}>
                  <Text style={styles.completionSummaryText}>
                    Side quest completion: {completedSideQuestCount} · Route tamam durumu:{' '}
                    {canCompleteRoute ? 'hazir' : 'hazir degil'}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {session.status !== 'completed' ? (
                    <>
                      <Pressable
                        onPress={() => {
                          setRouteSessionStatus(session.id, 'active');
                          navigation.navigate('RouteDetail', { routeId: session.routeId });
                        }}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                      >
                        <Text style={styles.primaryButtonText}>
                          {session.status === 'active' ? 'Detaya don' : 'Resume et'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setRouteSessionStatus(
                            session.id,
                            session.status === 'active' ? 'incomplete' : canCompleteRoute ? 'completed' : 'active'
                          )
                        }
                        style={({ pressed }) => [
                          styles.secondaryButton,
                          session.status === 'incomplete' && !canCompleteRoute && styles.secondaryButtonDisabled,
                          pressed && styles.buttonPressed,
                        ]}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {session.status === 'active'
                            ? 'Ara ver'
                            : canCompleteRoute
                              ? 'Tamamla'
                              : 'Detaya don'}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => navigation.navigate('RouteDetail', { routeId: session.routeId })}
                      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.secondaryButtonText}>Rotayi tekrar ac</Text>
                    </Pressable>
                  )}
                </View>

                {session.status !== 'completed' ? (
                  <BudgetEditor
                    routeSessionId={session.id}
                    routeDistanceKm={session.routeDistanceKm}
                    existingScenario={scenario}
                    onSave={upsertBudgetScenario}
                  />
                ) : budgetEstimate ? (
                  <View style={styles.budgetSummaryCard}>
                    <Text style={styles.budgetTitle}>{scenario?.name ?? 'Butce senaryosu'}</Text>
                    <Text style={styles.budgetBody}>Tahmini toplam: {budgetEstimate.totalCost.toFixed(0)} TL</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
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
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
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
    fontSize: 32,
    fontWeight: '900',
    marginTop: 6,
  },
  body: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 18,
  },
  emptyTitle: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 18,
  },
  sessionCardFocused: {
    borderColor: '#E6A52B',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sessionHeaderCopy: {
    flex: 1,
  },
  sessionCode: {
    color: '#E6A52B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sessionTitle: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sessionMeta: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2B2517',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: '#1D2A1E',
  },
  statusBadgeText: {
    color: '#F8D47B',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3138',
    backgroundColor: '#1D1E23',
    padding: 14,
  },
  metricValue: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#8C8F97',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completionSummary: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F3138',
    backgroundColor: '#1A1B20',
    padding: 12,
  },
  completionSummaryText: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#E6A52B',
    paddingVertical: 14,
    alignItems: 'center',
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
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.72,
  },
  secondaryButtonText: {
    color: '#F6F2E8',
    fontSize: 13,
    fontWeight: '700',
  },
  budgetCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2F3138',
    backgroundColor: '#1A1B20',
    padding: 14,
  },
  budgetTitle: {
    color: '#F6F2E8',
    fontSize: 17,
    fontWeight: '800',
  },
  budgetBody: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#343740',
    backgroundColor: '#111317',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#F6F2E8',
    fontSize: 14,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  tierWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tierChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3A3D45',
    backgroundColor: '#1E2026',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tierChipSelected: {
    borderColor: '#E6A52B',
    backgroundColor: '#2B2517',
  },
  tierChipText: {
    color: '#CBD0D8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tierChipTextSelected: {
    color: '#F8D47B',
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#31343C',
    backgroundColor: '#15161A',
    padding: 12,
    marginBottom: 10,
  },
  previewTitle: {
    color: '#F6F2E8',
    fontSize: 14,
    fontWeight: '800',
  },
  previewLine: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  previewTotal: {
    color: '#F8D47B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  budgetSummaryCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2F3138',
    backgroundColor: '#1A1B20',
    padding: 14,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
