import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SafeMapView, {
  Polygon,
  PROVIDER_GOOGLE,
} from "../components/SafeMapView";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const emojis = ["🎉", "✨", "🏆", "🎊", "⭐", "💥"];

const CaptureSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    name = "Janwada Area",
    distance = 1.5,
    time = "15:30",
    calories = 120,
    points = 150,
    polygon = [],
    center,
  } = route.params || {};

  const anims = useMemo(
    () => new Array(10).fill(0).map(() => new Animated.Value(-40)),
    []
  );

  useEffect(() => {
    anims.forEach((val, index) => {
      const duration = 4000 + index * 120;
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: SCREEN_HEIGHT,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: -40,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [anims]);

  const goToMap = () => {
    navigation.navigate("Tabs", { screen: "Home" });
  };

  return (
    <LinearGradient colors={["#6a11cb", "#ff5f6d"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.confettiLayer} pointerEvents="none">
          {anims.map((val, idx) => (
            <Animated.Text
              key={idx}
              style={[
                styles.confetti,
                {
                  transform: [
                    { translateY: val },
                    { translateX: (idx % 2 === 0 ? -1 : 1) * (idx * 6 + 10) },
                  ],
                  opacity: val.interpolate({
                    inputRange: [-40, SCREEN_HEIGHT * 0.7, SCREEN_HEIGHT],
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
            >
              {emojis[idx % emojis.length]}
            </Animated.Text>
          ))}
        </View>

        <Text style={styles.header}>TERRITORY CAPTURED! 🎉</Text>
        <Text style={styles.subheader}>{name}</Text>

        <View style={styles.mapWrapper}>
          <SafeMapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: center?.latitude || 21.1458,
              longitude: center?.longitude || 79.0882,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {polygon.length > 0 && (
              <Polygon
                coordinates={polygon}
                strokeColor="#FF4D67"
                fillColor="rgba(255,77,103,0.35)"
                strokeWidth={3}
              />
            )}
          </SafeMapView>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{time}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{calories} cal</Text>
          </View>
        </View>

        <View style={styles.pointsPill}>
          <Text style={styles.pointsText}>+{points} Mental Points</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={goToMap}>
            <Text style={styles.secondaryLabel}>VIEW MAP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={goToMap}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryLabel}>CAPTURE ANOTHER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: "absolute",
    fontSize: 22,
  },
  header: {
    color: COLORS.card,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  subheader: {
    color: COLORS.card,
    textAlign: "center",
    marginTop: -6,
    marginBottom: 10,
    opacity: 0.9,
    fontWeight: "700",
  },
  mapWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  map: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  statValue: {
    color: COLORS.card,
    fontWeight: "800",
    fontSize: 18,
    marginTop: 4,
  },
  pointsPill: {
    marginTop: 14,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  pointsText: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginRight: 8,
  },
  secondaryLabel: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 8,
  },
  primaryGradient: {
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryLabel: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});

export default CaptureSuccessScreen;
