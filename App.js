import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { COLORS } from "./src/constants/theme";
import AppNavigator from "./src/navigation/AppNavigator";

enableScreens();

const theme = {
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
    <NavigationContainer theme={theme}>
      <AppNavigator />
      <StatusBar style="dark" backgroundColor={COLORS.card} />
    </NavigationContainer>
  </SafeAreaProvider>
);

export default App;
