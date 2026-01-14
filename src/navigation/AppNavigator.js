import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ActivityTrackingScreen from "../screens/ActivityTrackingScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import TerritoryDetailModal from "../screens/TerritoryDetailModal";
import CaptureSuccessScreen from "../screens/CaptureSuccessScreen";
import { COLORS, GRADIENTS } from "../constants/theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ focused, icon, label }) => {
  if (focused) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.activeIconWrap}>
        <Ionicons name={icon} size={20} color={COLORS.card} />
        <Text style={styles.activeLabel}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.inactiveIconWrap}>
      <Ionicons name={icon} size={20} color="#999999" />
      <Text style={styles.inactiveLabel}>{label}</Text>
    </View>
  );
};

const Tabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
      component={MapScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} icon="home" label="Home" />
        ),
      }}
    />
    <Tab.Screen
      name="Stats"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} icon="bar-chart" label="Stats" />
        ),
      }}
    />
    <Tab.Screen
      name="Activity"
      component={ActivityTrackingScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} icon="walk" label="Activity" />
        ),
      }}
    />
    <Tab.Screen
      name="Leaderboard"
      component={LeaderboardScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} icon="trophy" label="Leaderboard" />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={Tabs} />
    <Stack.Screen name="ActivityTracking" component={ActivityTrackingScreen} />
    <Stack.Screen
      name="TerritoryDetail"
      component={TerritoryDetailModal}
      options={{
        presentation: "transparentModal",
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        cardStyle: { backgroundColor: "rgba(0,0,0,0.45)" },
      }}
    />
    <Stack.Screen
      name="CaptureSuccess"
      component={CaptureSuccessScreen}
      options={{
        presentation: "modal",
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
      }}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
  },
  activeIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  inactiveIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  activeLabel: {
    color: COLORS.card,
    marginLeft: 8,
    fontWeight: "800",
    fontSize: 12,
  },
  inactiveLabel: {
    color: "#999999",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 12,
  },
});

export default AppNavigator;
