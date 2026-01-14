import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SafeMapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
} from "../components/SafeMapView";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants/colors";

const NAGPUR_COORD = { latitude: 21.1458, longitude: 79.0882 };
const TARGET_TERRITORY_CENTER = {
  latitude: NAGPUR_COORD.latitude + 0.0062,
  longitude: NAGPUR_COORD.longitude + 0.0012,
};

const createHexagon = (centerLat, centerLng, radiusMeters = 500) => {
  const R = 6371000;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    points.push({
      latitude: centerLat + (dy / R) * (180 / Math.PI),
      longitude:
        centerLng +
        ((dx / R) * (180 / Math.PI)) / Math.cos((centerLat * Math.PI) / 180),
    });
  }
  return points;
};

const buildTerritories = () => {
  const base = NAGPUR_COORD;
  const yourCenters = [
    { latitude: base.latitude + 0.0042, longitude: base.longitude },
    { latitude: base.latitude + 0.0036, longitude: base.longitude + 0.0048 },
    { latitude: base.latitude + 0.0008, longitude: base.longitude + 0.0054 },
    { latitude: base.latitude - 0.0018, longitude: base.longitude + 0.0036 },
    { latitude: base.latitude - 0.0024, longitude: base.longitude - 0.0004 },
  ];

  const otherCenters = [
    { latitude: base.latitude + 0.0052, longitude: base.longitude - 0.0038 },
    { latitude: base.latitude + 0.0022, longitude: base.longitude - 0.0048 },
    { latitude: base.latitude - 0.0008, longitude: base.longitude - 0.0042 },
    { latitude: base.latitude - 0.0032, longitude: base.longitude - 0.003 },
    { latitude: base.latitude - 0.0046, longitude: base.longitude + 0.0018 },
    { latitude: base.latitude - 0.003, longitude: base.longitude + 0.0058 },
    { latitude: base.latitude + 0.0014, longitude: base.longitude + 0.0082 },
    { latitude: base.latitude + 0.0046, longitude: base.longitude + 0.007 },
  ];

  const availableCenters = [
    TARGET_TERRITORY_CENTER,
    { latitude: base.latitude + 0.0054, longitude: base.longitude - 0.007 },
    { latitude: base.latitude + 0.0018, longitude: base.longitude - 0.0072 },
    { latitude: base.latitude - 0.0012, longitude: base.longitude - 0.0062 },
    { latitude: base.latitude - 0.0048, longitude: base.longitude - 0.0014 },
    { latitude: base.latitude - 0.0056, longitude: base.longitude + 0.0036 },
    { latitude: base.latitude - 0.001, longitude: base.longitude + 0.0076 },
  ];

  const toPolygon = (centers, type) =>
    centers.map((center, idx) => ({
      id: `${type}-${idx}`,
      coords: createHexagon(center.latitude, center.longitude),
      type,
    }));

  return [
    ...toPolygon(yourCenters, "yours"),
    ...toPolygon(otherCenters, "others"),
    ...toPolygon(availableCenters, "available"),
  ];
};

const MapScreen = () => {
  const navigation = useNavigation();
  const [userCoord, setUserCoord] = useState(NAGPUR_COORD);
  const [territories] = useState(buildTerritories);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        setUserCoord({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch (_err) {
        // Keep fallback to Nagpur if location fails.
      }
    };

    requestLocation();
  }, []);

  const pulseStyle = useMemo(
    () => ({
      transform: [
        {
          scale: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 2.2],
          }),
        },
      ],
      opacity: pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 0],
      }),
    }),
    [pulse]
  );

  const renderPolygon = (poly) => {
    const palette = {
      yours: { stroke: "#FF4D67", fill: "rgba(255,77,103,0.35)" },
      others: { stroke: "#4DA3FF", fill: "rgba(77,163,255,0.28)" },
      available: { stroke: "#3DDC84", fill: "rgba(61,220,132,0.18)" },
    };

    return (
      <Polygon
        key={poly.id}
        coordinates={poly.coords}
        strokeColor={palette[poly.type].stroke}
        fillColor={palette[poly.type].fill}
        strokeWidth={2}
      />
    );
  };

  const handleCapturePress = () => {
    navigation.navigate("TerritoryDetail", {
      name: "Janwada Area",
      status: "Currently Unclaimed",
      distanceRequired: "Run 1.5 km in this zone",
      reward: "+150 points",
      polygon: createHexagon(
        TARGET_TERRITORY_CENTER.latitude,
        TARGET_TERRITORY_CENTER.longitude
      ),
      center: TARGET_TERRITORY_CENTER,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SafeMapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: NAGPUR_COORD.latitude,
          longitude: NAGPUR_COORD.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {territories.map(renderPolygon)}
        <Marker coordinate={userCoord} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.userMarkerWrapper}>
            <Animated.View style={[styles.pulse, pulseStyle]} />
            <View style={styles.userDot} />
          </View>
        </Marker>
      </SafeMapView>

      <View style={styles.topBar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FQ</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="grid" size={14} color={COLORS.card} />
          <Text style={[styles.badgeText, styles.leftPadSmall]}>
            8 Territories
          </Text>
        </View>
        <View style={styles.pointsRow}>
          <Ionicons name="trophy" size={16} color="#FFD166" />
          <Text style={[styles.pointsText, styles.leftPadSmaller]}>
            2,450 Points
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.captureButton}
        activeOpacity={0.9}
        onPress={handleCapturePress}
      >
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          style={styles.captureGradient}
        >
          <Ionicons name="flash" size={18} color={COLORS.card} />
          <Text style={[styles.captureText, styles.leftPadSmall]}>
            Capture Territory
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(14, 17, 33, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2A44",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatarText: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#5A67F2",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#5A67F2",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  badgeText: {
    color: COLORS.card,
    fontWeight: "700",
    fontSize: 14,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pointsText: {
    color: COLORS.card,
    fontWeight: "700",
    fontSize: 14,
  },
  leftPadSmall: {
    marginLeft: 8,
  },
  leftPadSmaller: {
    marginLeft: 6,
  },
  userMarkerWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(64, 158, 255, 0.4)",
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2E9BFF",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  captureButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },
  captureGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  captureText: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontSize: 14,
  },
});

export default MapScreen;
