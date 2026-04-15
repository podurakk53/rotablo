import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WarningItem } from './warning.types';

type RouteWarningsPanelProps = {
  generalWarnings: WarningItem[];
  vehicleWarnings: WarningItem[];
  hasVehicleProfile: boolean;
};

function severityLabel(severity: WarningItem['severity']) {
  if (severity === 'high') {
    return 'Yuksek';
  }

  if (severity === 'caution') {
    return 'Dikkat';
  }

  return 'Bilgi';
}

export const RouteWarningsPanel: React.FC<RouteWarningsPanelProps> = ({
  generalWarnings,
  vehicleWarnings,
  hasVehicleProfile,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel rota uyarilari</Text>
        {generalWarnings.length === 0 ? (
          <Text style={styles.emptyCopy}>Bu kapsam icin belirgin statik warning tetiklenmedi.</Text>
        ) : (
          generalWarnings.map((warning) => (
            <View key={warning.ruleCode} style={[styles.card, styles[`severity_${warning.severity}` as const]]}>
              <View style={styles.cardHeader}>
                <Text style={styles.ruleCode}>{warning.ruleCode}</Text>
                <Text style={styles.severityBadge}>{severityLabel(warning.severity)}</Text>
              </View>
              <Text style={styles.message}>{warning.message}</Text>
              <Text style={styles.sourceSummary}>{warning.sourceSummary}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arac uyumluluk uyarilari</Text>
        {!hasVehicleProfile ? (
          <Text style={styles.emptyCopy}>Secili bir Garage profili olunca arac uyumluluk uyarilari burada gorunur.</Text>
        ) : vehicleWarnings.length === 0 ? (
          <Text style={styles.emptyCopy}>Secili arac icin ek uyumluluk warning'i tetiklenmedi.</Text>
        ) : (
          vehicleWarnings.map((warning) => (
            <View key={warning.ruleCode} style={[styles.card, styles[`severity_${warning.severity}` as const]]}>
              <View style={styles.cardHeader}>
                <Text style={styles.ruleCode}>{warning.ruleCode}</Text>
                <Text style={styles.severityBadge}>{severityLabel(warning.severity)}</Text>
              </View>
              <Text style={styles.message}>{warning.message}</Text>
              <Text style={styles.sourceSummary}>{warning.sourceSummary}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  section: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2A2C33',
    backgroundColor: '#17181C',
    padding: 18,
  },
  sectionTitle: {
    color: '#F6F2E8',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyCopy: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  severity_high: {
    borderColor: '#7A4038',
    backgroundColor: '#241614',
  },
  severity_caution: {
    borderColor: '#685126',
    backgroundColor: '#201A12',
  },
  severity_info: {
    borderColor: '#314152',
    backgroundColor: '#141C25',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ruleCode: {
    color: '#F6F2E8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  severityBadge: {
    color: '#F8D47B',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  message: {
    color: '#F6F2E8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  sourceSummary: {
    color: '#A7A9B0',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});
