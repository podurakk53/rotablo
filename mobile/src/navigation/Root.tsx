import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteCatalogScreen } from '../features/catalog/RouteCatalogScreen';
import { RouteDetailScreen } from '../features/detail/RouteDetailScreen';
import { VehicleProfileForm } from '../features/vehicles/VehicleProfileForm';

export type RootStackParamList = {
  Main: undefined;
  RouteDetail: { routeId: string };
};

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const SessionPlaceholderScreen = () => (
  <View style={styles.center}>
    <Text style={styles.placeholderTitle}>Route Session yakinda</Text>
    <Text style={styles.placeholderBody}>
      T9 ile birlikte active, incomplete ve completed session akisi burada acilacak.
    </Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E6A52B',
        tabBarInactiveTintColor: '#767983',
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: '#F6F2E8',
      }}
    >
      <Tab.Screen name="Catalog" component={RouteCatalogScreen} options={{ title: 'Rotalar' }} />
      <Tab.Screen name="Session" component={SessionPlaceholderScreen} options={{ title: 'Oturum' }} />
      <Tab.Screen name="Garage" component={VehicleProfileForm} options={{ title: 'Garaj' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainTabs} />
      <RootStack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={{
          headerShown: true,
          presentation: 'card',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#F6F2E8',
          title: 'Route Detail',
        }}
      />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#0F1012',
  },
  placeholderTitle: {
    color: '#F6F2E8',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  placeholderBody: {
    color: '#A7A9B0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#121317',
    borderTopColor: '#26272B',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#121317',
  },
  headerTitle: {
    color: '#F6F2E8',
    fontSize: 18,
    fontWeight: '800',
  },
});
