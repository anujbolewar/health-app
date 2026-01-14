import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/constants/theme";

enableScreens();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.card,
    text: COLORS.text,
    primary: COLORS.primary,
    border: "transparent",
  },
};

const App = () => (
  <SafeAreaProvider>
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
      <StatusBar style="dark" backgroundColor={COLORS.card} />
    </NavigationContainer>
  </SafeAreaProvider>
);

export default App;
