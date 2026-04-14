import React, { startTransition, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchPublishedRoutes } from './catalog.api';
import type { RouteCatalogItem } from './catalog.types';
import { RouteCard } from '../../shared/components/RouteCard';

export const RouteCatalogScreen = () => {
  const [routes, setRoutes] = useState<RouteCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRoutes = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const nextRoutes = await fetchPublishedRoutes();
      startTransition(() => {
        setRoutes(nextRoutes);
        setErrorMessage(null);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Katalog yuklenemedi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes('initial');
  }, [loadRoutes]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Yayinlanmis Rotalar</Text>
        <Text style={styles.headerTitle}>Rota Katalogu</Text>
        <Text style={styles.headerDescription}>
          Editoryal olarak hazirlanan published rotalari kesfet. R01 publish edildigi anda bu
          liste gercek Supabase verisini gostermeye baslar.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#E6A52B" />
          <Text style={styles.stateTitle}>Katalog yukleniyor</Text>
          <Text style={styles.stateBody}>Published route listesi Supabase uzerinden okunuyor.</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Katalog baglanamadi</Text>
          <Text style={styles.stateBody}>{errorMessage}</Text>
          <Text style={styles.stateHint}>
            `mobile/.env` icine `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY`
            degerlerini ekleyin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={routes.length === 0 ? styles.emptyListContent : styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadRoutes('refresh')} />}
          renderItem={({ item }) => (
            <RouteCard route={item} onPress={() => console.log('Route detail yakinda:', item.slug)} />
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>Henuz yayinlanmis rota yok</Text>
              <Text style={styles.stateBody}>
                Katalog yalnizca `published` route gosterir. Publish sonrasi ilk gorunen veri `R01`
                olacak.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1012',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 4,
  },
  headerSubtitle: {
    color: '#E6A52B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: '#F6F2E8',
    fontSize: 32,
    fontWeight: '900',
  },
  headerDescription: {
    color: '#A7A9B0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 64,
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
  stateHint: {
    color: '#7B7E86',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
