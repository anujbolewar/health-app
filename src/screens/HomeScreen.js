import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { COLORS, GRADIENTS } from "../constants/theme";

const STATS = [
  { label: "Weekly Steps", value: "48,120" },
  { label: "Move Goal", value: "92%" },
  { label: "Active Minutes", value: "74 min" },
];

const DEFAULT_MESSAGE = "Tap below to check your location";
const PERMISSION_DENIED =
  "Location access denied. Enable in settings to continue.";
const ERROR_MESSAGE = "Unable to get location. Please try again.";

const HomeScreen = () => {
  const [locationStatus, setLocationStatus] = useState(DEFAULT_MESSAGE);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationStatus(PERMISSION_DENIED);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocationStatus(
        `Location: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(
          4
        )}`
      );
    } catch {
      setLocationStatus(ERROR_MESSAGE);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <LinearGradient colors={GRADIENTS.hero} style={styles.heroCard}>
          <Text style={styles.title}>Welcome to FitQuest</Text>
          <Text style={styles.subtitle}>
            Track movement, explore routes, and stay on pace.
          </Text>
          <PrimaryButton label="Check location" onPress={requestLocation} />
          <Text style={styles.status}>{locationStatus}</Text>
        </LinearGradient>
      </View>

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Today</Text>
        <Text style={styles.hint}>Synced just now</Text>
      </View>

      <View style={styles.stats}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    marginTop: 16,
    marginBottom: 18,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: COLORS.text,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    color: COLORS.card,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: COLORS.card,
    opacity: 0.9,
    fontSize: 15,
    lineHeight: 20,
  },
  status: {
    color: COLORS.card,
    opacity: 0.9,
    fontSize: 13,
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

export default HomeScreen;
