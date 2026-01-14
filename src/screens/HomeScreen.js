import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { COLORS, GRADIENTS } from "../constants/colors";

const quickStats = [
  { label: "Weekly Steps", value: "48,120" },
  { label: "Move Goal", value: "92%" },
  { label: "Active Minutes", value: "74 min" },
];

const HomeScreen = () => {
  const [locationMessage, setLocationMessage] = useState(
    "Location access has not been requested yet."
  );

  const handleCheckLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationMessage(
          "Permission denied. Enable location in settings to use maps."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      setLocationMessage(
        `Location ready at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );
    } catch (_error) {
      setLocationMessage(
        "Unable to read location right now. Try again in a moment."
      );
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroWrapper}>
        <LinearGradient colors={GRADIENTS.hero} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Welcome to FitQuest</Text>
          <Text style={styles.heroSubtitle}>
            Track movement, explore routes, and stay on pace.
          </Text>
          <PrimaryButton label="Check location" onPress={handleCheckLocation} />
          <Text style={styles.locationMessage}>{locationMessage}</Text>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Today</Text>
        <Text style={styles.sectionHint}>Synced just now</Text>
      </View>

      <View style={styles.statsRow}>
        {quickStats.map((stat) => (
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
  heroWrapper: {
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
  heroTitle: {
    color: COLORS.card,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    color: COLORS.card,
    opacity: 0.9,
    fontSize: 15,
    lineHeight: 20,
  },
  locationMessage: {
    color: COLORS.card,
    opacity: 0.9,
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeaderRow: {
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
  sectionHint: {
    color: COLORS.muted,
    fontSize: 13,
  },
  statsRow: {
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
