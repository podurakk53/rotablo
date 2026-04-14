import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteCatalogItem } from '../../features/catalog/catalog.types';

interface RouteCardProps {
  route: RouteCatalogItem;
  onPress: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onPress }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{route.code}</Text>
        </View>
        <Text style={styles.routeLine} numberOfLines={1}>
          {route.originLabel} - {route.destinationLabel}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {route.name}
      </Text>

      <Text style={styles.summary} numberOfLines={3}>
        {route.summary}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{route.plannedDistanceKm.toLocaleString('tr-TR')}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{route.plannedStageCount}</Text>
          <Text style={styles.statLabel}>etap</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 22,
    backgroundColor: '#17171A',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2B2C31',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  containerPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#E6A52B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: '#111214',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  routeLine: {
    flex: 1,
    color: '#B2B3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: '#F6F2E8',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 29,
    marginBottom: 10,
  },
  summary: {
    color: '#B9BBC3',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 66,
  },
  footerRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#26272B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8B8D95',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#36373D',
    marginHorizontal: 14,
  },
});
