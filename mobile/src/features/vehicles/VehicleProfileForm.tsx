import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { VEHICLE_REFERENCE_DATA } from './vehicleReference.data';
import type {
  GroundClearanceClass,
  TireSeason,
  VehicleBodyType,
  VehicleDrivetrain,
  VehicleProfileRecord,
  VehicleProfileSource,
  VehicleReferenceRecord,
} from './vehicle.types';

const BODY_TYPE_LABELS: Record<VehicleBodyType, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  hatchback: 'Hatchback',
  coupe: 'Coupe',
  convertible: 'Convertible',
};

const DRIVETRAIN_LABELS: Record<VehicleDrivetrain, string> = {
  fwd: 'FWD',
  rwd: 'RWD',
  awd: 'AWD',
  '4wd': '4WD',
};

const CLEARANCE_LABELS: Record<GroundClearanceClass, string> = {
  low: 'Dusuk',
  medium: 'Orta',
  high: 'Yuksek',
};

const TIRE_LABELS: Record<TireSeason, string> = {
  summer: 'Yaz',
  allSeason: '4 mevsim',
  winter: 'Kis',
};

function findReferenceVehicle(
  brand: string,
  model: string,
  modelYear: number | null
): VehicleReferenceRecord | null {
  if (!brand || !model || !modelYear) {
    return null;
  }

  return (
    VEHICLE_REFERENCE_DATA.find(
      (entry) =>
        entry.brand === brand &&
        entry.model === model &&
        modelYear >= entry.yearFrom &&
        modelYear <= entry.yearTo
    ) ?? null
  );
}

function getUniqueBrands() {
  return Array.from(new Set(VEHICLE_REFERENCE_DATA.map((entry) => entry.brand))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function getModelsForBrand(brand: string) {
  return Array.from(
    new Set(
      VEHICLE_REFERENCE_DATA.filter((entry) => entry.brand === brand).map((entry) => entry.model)
    )
  ).sort((left, right) => left.localeCompare(right));
}

function getYearsForSelection(brand: string, model: string) {
  const years = new Set<number>();

  VEHICLE_REFERENCE_DATA.filter((entry) => entry.brand === brand && entry.model === model).forEach((entry) => {
    for (let year = entry.yearTo; year >= entry.yearFrom; year -= 1) {
      years.add(year);
    }
  });

  return Array.from(years).sort((left, right) => right - left);
}

function describeReference(entry: VehicleReferenceRecord | null) {
  if (!entry) {
    return 'Listeden secilen arac bulunamazsa manual fallback acilir.';
  }

  return `${BODY_TYPE_LABELS[entry.bodyType]} · ${DRIVETRAIN_LABELS[entry.drivetrain]} · ${CLEARANCE_LABELS[entry.groundClearanceClass]}`;
}

function formatGarageHeadline(profile: VehicleProfileRecord) {
  return profile.modelYear ? `${profile.brand} ${profile.model} ${profile.modelYear}` : `${profile.brand} ${profile.model}`;
}

function usesManualTechnicalOverride(
  profile: VehicleProfileRecord,
  referenceEntry: VehicleReferenceRecord | null
) {
  if (profile.source === 'manual' || !referenceEntry) {
    return true;
  }

  return (
    profile.bodyType !== referenceEntry.bodyType ||
    profile.drivetrain !== referenceEntry.drivetrain ||
    profile.groundClearanceClass !== referenceEntry.groundClearanceClass
  );
}

export const VehicleProfileForm = () => {
  const vehicleProfiles = useAppStore((state) => state.vehicleProfiles);
  const selectedVehicleProfileId = useAppStore((state) => state.selectedVehicleProfileId);
  const upsertVehicleProfile = useAppStore((state) => state.upsertVehicleProfile);
  const selectVehicleProfile = useAppStore((state) => state.selectVehicleProfile);

  const [mode, setMode] = useState<VehicleProfileSource>('reference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [modelYear, setModelYear] = useState<number | null>(null);
  const [tireSeason, setTireSeason] = useState<TireSeason>('allSeason');
  const [bodyType, setBodyType] = useState<VehicleBodyType>('sedan');
  const [drivetrain, setDrivetrain] = useState<VehicleDrivetrain>('fwd');
  const [groundClearanceClass, setGroundClearanceClass] = useState<GroundClearanceClass>('medium');
  const [manualTechnicalOverride, setManualTechnicalOverride] = useState(false);

  const availableBrands = getUniqueBrands();
  const availableModels = brand ? getModelsForBrand(brand) : [];
  const availableYears = brand && model ? getYearsForSelection(brand, model) : [];
  const matchedReference = findReferenceVehicle(brand, model, modelYear);

  useEffect(() => {
    if (mode !== 'reference') {
      return;
    }

    if (brand && !availableModels.includes(model)) {
      setModel('');
      setModelYear(null);
    }
  }, [availableModels, brand, mode, model]);

  useEffect(() => {
    if (mode !== 'reference') {
      return;
    }

    if (modelYear !== null && !availableYears.includes(modelYear)) {
      setModelYear(null);
    }
  }, [availableYears, mode, modelYear]);

  useEffect(() => {
    if (mode !== 'reference' || manualTechnicalOverride || !matchedReference) {
      return;
    }

    setBodyType(matchedReference.bodyType);
    setDrivetrain(matchedReference.drivetrain);
    setGroundClearanceClass(matchedReference.groundClearanceClass);
  }, [manualTechnicalOverride, matchedReference, mode]);

  const resetForm = () => {
    setMode('reference');
    setEditingId(null);
    setBrand('');
    setModel('');
    setModelYear(null);
    setTireSeason('allSeason');
    setBodyType('sedan');
    setDrivetrain('fwd');
    setGroundClearanceClass('medium');
    setManualTechnicalOverride(false);
  };

  const startEditing = (profile: VehicleProfileRecord) => {
    const referenceEntry = profile.referenceVehicleKey
      ? VEHICLE_REFERENCE_DATA.find((entry) => entry.key === profile.referenceVehicleKey) ?? null
      : findReferenceVehicle(profile.brand, profile.model, profile.modelYear);

    setEditingId(profile.id);
    setMode(profile.source);
    setBrand(profile.brand);
    setModel(profile.model);
    setModelYear(profile.modelYear);
    setTireSeason(profile.tireSeason);
    setBodyType(profile.bodyType);
    setDrivetrain(profile.drivetrain);
    setGroundClearanceClass(profile.groundClearanceClass);
    setManualTechnicalOverride(usesManualTechnicalOverride(profile, referenceEntry));
  };

  const saveVehicleProfile = () => {
    const normalizedBrand = brand.trim();
    const normalizedModel = model.trim();
    const normalizedYear =
      typeof modelYear === 'number' && Number.isFinite(modelYear) ? Math.round(modelYear) : null;

    if (!normalizedBrand || !normalizedModel) {
      Alert.alert('Eksik alan', 'Marka ve model secimi olmadan garaja kayit yapilamaz.');
      return;
    }

    if (!normalizedYear || normalizedYear < 1980 || normalizedYear > 2030) {
      Alert.alert('Yil gerekli', 'Arac profili icin gecerli bir model yili secin.');
      return;
    }

    if (mode === 'reference' && !matchedReference) {
      Alert.alert(
        'Reference eslesmesi yok',
        'Bu kombinasyon curated listede yok. Manual fallback moduna gecip teknik alanlari elle doldurun.'
      );
      return;
    }

    const savedId = upsertVehicleProfile({
      id: editingId ?? undefined,
      brand: normalizedBrand,
      model: normalizedModel,
      modelYear: normalizedYear,
      bodyType,
      drivetrain,
      groundClearanceClass,
      tireSeason,
      referenceVehicleKey: mode === 'reference' && matchedReference ? matchedReference.key : null,
      source: mode,
    });

    selectVehicleProfile(savedId);
    Alert.alert(
      editingId ? 'Arac guncellendi' : 'Arac kaydedildi',
      `${normalizedBrand} ${normalizedModel} garaja eklendi ve secili profil oldu.`
    );
    resetForm();
  };

  const renderSelectionChips = <T extends string | number>(
    options: T[],
    selectedValue: T | null,
    onSelect: (value: T) => void
  ) => (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const key = typeof option === 'number' ? option.toString() : option;
        const selected = selectedValue === option;

        return (
          <Pressable
            key={key}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderEnumChips = <T extends string>(
    options: T[],
    selectedValue: T,
    onSelect: (value: T) => void,
    labelMap: Record<T, string>
  ) => (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const selected = selectedValue === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{labelMap[option]}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Garage</Text>
          <Text style={styles.title}>Arac Profili</Text>
          <Text style={styles.body}>
            Marka, model, yil ve lastik sec. Sistem teknik alanlari onerir; gerekirse override et.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kayitli Garaj</Text>
            <Text style={styles.sectionBody}>
              Auth gelmeden once garage state lokalde tutuluyor. Secili profil T9 icin temel olacak.
            </Text>
          </View>

          {vehicleProfiles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Henuz arac yok</Text>
              <Text style={styles.emptyBody}>
                Ilk profili eklediginde Garage tabinda secili uyumluluk profili olusacak.
              </Text>
            </View>
          ) : (
            vehicleProfiles.map((profile) => {
              const isSelected = profile.id === selectedVehicleProfileId;

              return (
                <View key={profile.id} style={[styles.garageCard, isSelected && styles.garageCardSelected]}>
                  <View style={styles.garageCardHeader}>
                    <View style={styles.garageCardCopy}>
                      <Text style={styles.garageCardTitle}>{formatGarageHeadline(profile)}</Text>
                      <Text style={styles.garageCardMeta}>
                        {BODY_TYPE_LABELS[profile.bodyType]} · {DRIVETRAIN_LABELS[profile.drivetrain]} ·{' '}
                        {CLEARANCE_LABELS[profile.groundClearanceClass]} · {TIRE_LABELS[profile.tireSeason]}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Secili</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.garageActions}>
                    <Pressable
                      onPress={() => selectVehicleProfile(profile.id)}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        isSelected && styles.secondaryButtonDisabled,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.secondaryButtonText}>{isSelected ? 'Secili profil' : 'Sec'}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => startEditing(profile)}
                      style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                    >
                      <Text style={styles.secondaryButtonText}>Duzenle</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editingId ? 'Profili Duzenle' : 'Yeni Profil'}</Text>
            <Text style={styles.sectionBody}>
              Sahibinden benzeri secim hissi korunuyor ama veri kaynagi dis entegrasyon degil, curated dataset.
            </Text>
          </View>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => {
                setMode('reference');
                setManualTechnicalOverride(false);
              }}
              style={({ pressed }) => [
                styles.modeCard,
                mode === 'reference' && styles.modeCardSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.modeTitle, mode === 'reference' && styles.modeTitleSelected]}>Listeden sec</Text>
              <Text style={styles.modeBody}>Marka, model ve yil sec. Teknik alanlar otomatik onerilsin.</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode('manual');
                setManualTechnicalOverride(true);
              }}
              style={({ pressed }) => [
                styles.modeCard,
                mode === 'manual' && styles.modeCardSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.modeTitle, mode === 'manual' && styles.modeTitleSelected]}>Manual fallback</Text>
              <Text style={styles.modeBody}>Aracin listede yoksa tum alanlari kendin gir.</Text>
            </Pressable>
          </View>

          {mode === 'reference' ? (
            <>
              <View style={styles.formBlock}>
                <Text style={styles.label}>1. Marka</Text>
                {renderSelectionChips(availableBrands, brand || null, (value) => {
                  setBrand(value);
                  setModel('');
                  setModelYear(null);
                  setManualTechnicalOverride(false);
                })}
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>2. Model</Text>
                {availableModels.length > 0 ? (
                  renderSelectionChips(availableModels, model || null, (value) => {
                    setModel(value);
                    setModelYear(null);
                    setManualTechnicalOverride(false);
                  })
                ) : (
                  <Text style={styles.helperText}>Once marka sec.</Text>
                )}
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>3. Yil</Text>
                {availableYears.length > 0 ? (
                  renderSelectionChips(availableYears, modelYear, (value) => {
                    setModelYear(value);
                    setManualTechnicalOverride(false);
                  })
                ) : (
                  <Text style={styles.helperText}>Yil secimi icin once model sec.</Text>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.formBlock}>
                <Text style={styles.label}>Marka</Text>
                <TextInput
                  style={styles.input}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Orn: Subaru"
                  placeholderTextColor="#6F727B"
                />
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Orn: Forester"
                  placeholderTextColor="#6F727B"
                />
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>Yil</Text>
                <TextInput
                  style={styles.input}
                  value={modelYear ? modelYear.toString() : ''}
                  onChangeText={(value) => setModelYear(value ? Number(value.replace(/[^0-9]/g, '')) : null)}
                  placeholder="Orn: 2022"
                  placeholderTextColor="#6F727B"
                  keyboardType="number-pad"
                />
              </View>
            </>
          )}

          <View style={styles.formBlock}>
            <Text style={styles.label}>4. Lastik mevsimi</Text>
            {renderEnumChips(['summer', 'allSeason', 'winter'], tireSeason, setTireSeason, TIRE_LABELS)}
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Teknik alan onerisi</Text>
            <Text style={styles.suggestionBody}>{describeReference(matchedReference)}</Text>

            {mode === 'reference' ? (
              <Pressable
                onPress={() => {
                  if (matchedReference && manualTechnicalOverride) {
                    setBodyType(matchedReference.bodyType);
                    setDrivetrain(matchedReference.drivetrain);
                    setGroundClearanceClass(matchedReference.groundClearanceClass);
                    setManualTechnicalOverride(false);
                    return;
                  }

                  setManualTechnicalOverride(true);
                }}
                style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.linkButtonText}>
                  {manualTechnicalOverride ? 'Oneriye don' : 'Teknik alanlari duzenle'}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {(mode === 'manual' || manualTechnicalOverride || !matchedReference) ? (
            <View style={styles.technicalPanel}>
              <View style={styles.formBlock}>
                <Text style={styles.label}>Govde tipi</Text>
                {renderEnumChips(
                  ['sedan', 'suv', 'hatchback', 'coupe', 'convertible'],
                  bodyType,
                  setBodyType,
                  BODY_TYPE_LABELS
                )}
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>Cekis tipi</Text>
                {renderEnumChips(['fwd', 'rwd', 'awd', '4wd'], drivetrain, setDrivetrain, DRIVETRAIN_LABELS)}
              </View>

              <View style={styles.formBlock}>
                <Text style={styles.label}>Yerden yukseklik</Text>
                {renderEnumChips(['low', 'medium', 'high'], groundClearanceClass, setGroundClearanceClass, CLEARANCE_LABELS)}
              </View>
            </View>
          ) : (
            <View style={styles.lockedSummary}>
              <Text style={styles.lockedSummaryText}>
                {BODY_TYPE_LABELS[bodyType]} · {DRIVETRAIN_LABELS[drivetrain]} · {CLEARANCE_LABELS[groundClearanceClass]}
              </Text>
            </View>
          )}

          <View style={styles.formActions}>
            <Pressable onPress={saveVehicleProfile} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>{editingId ? 'Profili guncelle' : 'Araci kaydet'}</Text>
            </Pressable>

            {(editingId || brand || model || modelYear) ? (
              <Pressable onPress={resetForm} style={({ pressed }) => [styles.ghostButton, pressed && styles.buttonPressed]}>
                <Text style={styles.ghostButtonText}>Temizle</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
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
  section: {
    marginTop: 6,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F6F2E8',
    fontSize: 23,
    fontWeight: '800',
  },
  sectionBody: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#292C34',
    backgroundColor: '#17181C',
    padding: 18,
  },
  emptyTitle: {
    color: '#F6F2E8',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyBody: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  garageCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 16,
    marginBottom: 12,
  },
  garageCardSelected: {
    borderColor: '#E6A52B',
    backgroundColor: '#1B1A14',
  },
  garageCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  garageCardCopy: {
    flex: 1,
  },
  garageCardTitle: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
  garageCardMeta: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  primaryBadge: {
    borderRadius: 999,
    backgroundColor: '#E6A52B',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  primaryBadgeText: {
    color: '#111214',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  garageActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#373A42',
    backgroundColor: '#202229',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    borderColor: '#4D4121',
    backgroundColor: '#2A2417',
  },
  secondaryButtonText: {
    color: '#F6F2E8',
    fontSize: 13,
    fontWeight: '700',
  },
  modeRow: {
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 16,
  },
  modeCardSelected: {
    borderColor: '#E6A52B',
    backgroundColor: '#1B1A14',
  },
  modeTitle: {
    color: '#F6F2E8',
    fontSize: 16,
    fontWeight: '800',
  },
  modeTitleSelected: {
    color: '#F8D47B',
  },
  modeBody: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  formBlock: {
    marginBottom: 18,
  },
  label: {
    color: '#F6F2E8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperText: {
    color: '#7E818A',
    fontSize: 13,
    lineHeight: 19,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#353841',
    backgroundColor: '#191A1F',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    borderColor: '#E6A52B',
    backgroundColor: '#2B2517',
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipText: {
    color: '#CBD0D8',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#F8D47B',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30333B',
    backgroundColor: '#17181C',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#F6F2E8',
    fontSize: 15,
  },
  suggestionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#16171B',
    padding: 16,
    marginBottom: 16,
  },
  suggestionTitle: {
    color: '#F6F2E8',
    fontSize: 15,
    fontWeight: '800',
  },
  suggestionBody: {
    color: '#A7A9B0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  linkButtonText: {
    color: '#F8D47B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  technicalPanel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 16,
  },
  lockedSummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 16,
    marginBottom: 12,
  },
  lockedSummaryText: {
    color: '#F6F2E8',
    fontSize: 14,
    fontWeight: '700',
  },
  formActions: {
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#E6A52B',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#111214',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  ghostButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#353841',
    backgroundColor: '#17181C',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#CBD0D8',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
