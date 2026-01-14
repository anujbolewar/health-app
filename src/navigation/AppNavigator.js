import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, GRADIENTS } from "../constants/theme";
import ActivityTrackingScreen from "../screens/ActivityTrackingScreen";
import CaptureSuccessScreen from "../screens/CaptureSuccessScreen";
import FreeFlowMapScreen from "../screens/FreeFlowMapScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TerritoryDetailModal from "../screens/TerritoryDetailModal";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ focused, icon, label }) =>
  focused ? (
    <LinearGradient colors={GRADIENTS.primary} style={styles.activeTab}>
      <Ionicons name={icon} size={20} color={COLORS.card} />
      <Text style={styles.activeLabel}>{label}</Text>
    </LinearGradient>
  ) : (
    <View style={styles.inactiveTab}>
      <Ionicons name={icon} size={20} color={COLORS.muted} />
      <Text style={styles.inactiveLabel}>{label}</Text>
    </View>
  );

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
      name="FreeFlowCapture"
      component={FreeFlowMapScreen}
      options={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    />
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
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
  },
  activeTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  activeLabel: {
    color: COLORS.card,
    fontWeight: "800",
    fontSize: 12,
  },
  inactiveLabel: {
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 4,
    fontSize: 12,
  },
});

export default AppNavigator;
