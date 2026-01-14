import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, GRADIENTS } from "../constants/colors";
import { LinearGradient } from "expo-linear-gradient";

const TARGET_DISTANCE = 1.5;
const AUTO_COMPLETE_SECONDS = 15;

const ActivityTrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name = "Janwada Area", polygon = [], center } = route.params || {};

  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0.4);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);

  const progress = Math.min(distance / TARGET_DISTANCE, 1);

  const formattedElapsed = useMemo(() => {
    const minutes = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(elapsed % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsed]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
      setDistance((prev) =>
        Math.min(
          TARGET_DISTANCE,
          prev + TARGET_DISTANCE / AUTO_COMPLETE_SECONDS
        )
      );
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const completeCapture = useCallback(() => {
    if (completed) return;
    setCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigation.replace("CaptureSuccess", {
      name,
      distance: TARGET_DISTANCE,
      time: "15:30",
      calories: 120,
      points: 150,
      polygon,
      center,
    });
  }, [center, completed, navigation, name, polygon]);

  useEffect(() => {
    if (!completed && elapsed >= AUTO_COMPLETE_SECONDS) {
      completeCapture();
    }
  }, [elapsed, completed, completeCapture]);

  return (
    <SafeAreaView style={styles.container}>
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
        >
          {polygon.length > 0 && (
            <Polygon
              coordinates={polygon}
              strokeColor="#FF4D67"
              fillColor="rgba(255,77,103,0.25)"
              strokeWidth={2}
            />
          )}
        </SafeMapView>
        <View style={styles.timerBadge}>
          <Ionicons name="time" size={16} color={COLORS.card} />
          <Text style={styles.timerText}>{formattedElapsed}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Capture: {name}</Text>
        <Text style={styles.progressLabel}>
          Distance in zone: {distance.toFixed(1)}km /{" "}
          {TARGET_DISTANCE.toFixed(1)}km
        </Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={completeCapture}
          style={styles.stopButton}
        >
          <LinearGradient
            colors={["#FF6B6B", "#FF8E53"]}
            style={styles.stopGradient}
          >
            <Text style={styles.stopLabel}>STOP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  timerBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerText: {
    color: COLORS.card,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoCard: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.muted,
    marginBottom: 10,
    fontSize: 14,
  },
  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: GRADIENTS.action[0],
  },
  stopButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  stopGradient: {
    alignItems: "center",
    paddingVertical: 14,
  },
  stopLabel: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontSize: 15,
  },
});

export default ActivityTrackingScreen;
