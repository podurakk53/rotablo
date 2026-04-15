import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteCatalogScreen } from '../features/catalog/RouteCatalogScreen';
import { RouteDetailScreen } from '../features/detail/RouteDetailScreen';
import { RouteSessionScreen } from '../features/sessions/RouteSessionScreen';
import { VehicleProfileForm } from '../features/vehicles/VehicleProfileForm';

export type RootStackParamList = {
  Main: undefined;
  RouteDetail: { routeId: string };
};

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator<RootStackParamList>();

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
      <Tab.Screen name="Session" component={RouteSessionScreen} options={{ title: 'Oturum' }} />
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
