import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteDetailSideQuest } from './routeDetail.types';

interface RouteStaticMapProps {
  sideQuests: RouteDetailSideQuest[];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function computeMarkerPosition(sideQuest: RouteDetailSideQuest, allSideQuests: RouteDetailSideQuest[]) {
  const latitudes = allSideQuests.map((item) => item.latitude);
  const longitudes = allSideQuests.map((item) => item.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const latRange = maxLat - minLat || 1;
  const lonRange = maxLon - minLon || 1;

  const topPercent = clamp(((maxLat - sideQuest.latitude) / latRange) * 100, 6, 90);
  const leftPercent = clamp(((sideQuest.longitude - minLon) / lonRange) * 100, 6, 92);

  return { topPercent, leftPercent };
}

function openGoogleMaps(sideQuest: RouteDetailSideQuest) {
  const query = `${sideQuest.latitude},${sideQuest.longitude}`;
  void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
}

export const RouteStaticMap: React.FC<RouteStaticMapProps> = ({ sideQuests }) => {
  if (sideQuests.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Harita Gorunumu</Text>
      <Text style={styles.title}>Side quest marker paneli</Text>
      <Text style={styles.description}>
        Bu gorunum canli navigasyon degil. Marker&apos;a dokununca ilgili side quest Google Maps ile acilir.
      </Text>

      <View style={styles.mapPlane}>
        <View style={styles.gridOverlay} />
        {sideQuests.map((sideQuest, index) => {
          const { topPercent, leftPercent } = computeMarkerPosition(sideQuest, sideQuests);

          return (
            <Pressable
              key={sideQuest.id}
              onPress={() => openGoogleMaps(sideQuest)}
              style={[styles.marker, { top: `${topPercent}%`, left: `${leftPercent}%` }]}
            >
              <Text style={styles.markerText}>{index + 1}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendList}>
        {sideQuests.map((sideQuest, index) => (
          <Pressable key={sideQuest.id} onPress={() => openGoogleMaps(sideQuest)} style={styles.legendRow}>
            <View style={styles.legendBadge}>
              <Text style={styles.legendBadgeText}>{index + 1}</Text>
            </View>
            <View style={styles.legendCopy}>
              <Text style={styles.legendTitle}>{sideQuest.name}</Text>
              <Text style={styles.legendMeta}>
                {sideQuest.type} • {sideQuest.distanceKm} km
              </Text>
            </View>
            <Text style={styles.legendAction}>Google Maps</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: '#15161A',
    borderWidth: 1,
    borderColor: '#2A2C33',
    padding: 18,
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
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  description: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 14,
  },
  mapPlane: {
    height: 220,
    borderRadius: 18,
    backgroundColor: '#0D0E10',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#23252B',
    position: 'relative',
    marginBottom: 14,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E2127',
  },
  marker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6A52B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    marginTop: -14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  markerText: {
    color: '#111214',
    fontSize: 12,
    fontWeight: '900',
  },
  legendList: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#23252B',
  },
  legendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6A52B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendBadgeText: {
    color: '#111214',
    fontSize: 12,
    fontWeight: '900',
  },
  legendCopy: {
    flex: 1,
  },
  legendTitle: {
    color: '#F6F2E8',
    fontSize: 15,
    fontWeight: '700',
  },
  legendMeta: {
    color: '#8B8D95',
    fontSize: 13,
    marginTop: 2,
  },
  legendAction: {
    color: '#E6A52B',
    fontSize: 12,
    fontWeight: '700',
  },
});
