import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { COLORS } from "../constants/theme";

const EARTH_RADIUS = 6371000;
const BASE_LOCATION = { latitude: 21.1458, longitude: 79.0882 };
const HEX_RADIUS = 500;

const TARGET_TERRITORY = {
  latitude: BASE_LOCATION.latitude + 0.0062,
  longitude: BASE_LOCATION.longitude + 0.0012,
};

const TERRITORY_COLORS = {
  yours: { stroke: "#FF4D67", fill: "rgba(255,77,103,0.35)" },
  others: { stroke: "#4DA3FF", fill: "rgba(77,163,255,0.28)" },
  available: { stroke: "#3DDC84", fill: "rgba(61,220,132,0.18)" },
};

const createHexagon = (lat, lng, radius = HEX_RADIUS) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    points.push({
      latitude: lat + (dy / EARTH_RADIUS) * (180 / Math.PI),
      longitude:
        lng +
        ((dx / EARTH_RADIUS) * (180 / Math.PI)) /
          Math.cos((lat * Math.PI) / 180),
    });
  }
  return points;
};

const buildTerritories = () => {
  const createTerritories = (centers, type) =>
    centers.map((center, idx) => ({
      id: `${type}-${idx}`,
      coords: createHexagon(center.latitude, center.longitude),
      type,
    }));

  const yours = [
    {
      latitude: BASE_LOCATION.latitude + 0.0042,
      longitude: BASE_LOCATION.longitude,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0036,
      longitude: BASE_LOCATION.longitude + 0.0048,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0008,
      longitude: BASE_LOCATION.longitude + 0.0054,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0018,
      longitude: BASE_LOCATION.longitude + 0.0036,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0024,
      longitude: BASE_LOCATION.longitude - 0.0004,
    },
  ];

  const others = [
    {
      latitude: BASE_LOCATION.latitude + 0.0052,
      longitude: BASE_LOCATION.longitude - 0.0038,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0022,
      longitude: BASE_LOCATION.longitude - 0.0048,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0008,
      longitude: BASE_LOCATION.longitude - 0.0042,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0032,
      longitude: BASE_LOCATION.longitude - 0.003,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0046,
      longitude: BASE_LOCATION.longitude + 0.0018,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.003,
      longitude: BASE_LOCATION.longitude + 0.0058,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0014,
      longitude: BASE_LOCATION.longitude + 0.0082,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0046,
      longitude: BASE_LOCATION.longitude + 0.007,
    },
  ];

  const available = [
    TARGET_TERRITORY,
    {
      latitude: BASE_LOCATION.latitude + 0.0054,
      longitude: BASE_LOCATION.longitude - 0.007,
    },
    {
      latitude: BASE_LOCATION.latitude + 0.0018,
      longitude: BASE_LOCATION.longitude - 0.0072,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0012,
      longitude: BASE_LOCATION.longitude - 0.0062,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0048,
      longitude: BASE_LOCATION.longitude - 0.0014,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.0056,
      longitude: BASE_LOCATION.longitude + 0.0036,
    },
    {
      latitude: BASE_LOCATION.latitude - 0.001,
      longitude: BASE_LOCATION.longitude + 0.0076,
    },
  ];

  return [
    ...createTerritories(yours, "yours"),
    ...createTerritories(others, "others"),
    ...createTerritories(available, "available"),
  ];
};

const MapScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(BASE_LOCATION);
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
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch {}
    };

    getLocation();
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

  const renderTerritory = (territory) => (
    <Polygon
      key={territory.id}
      coordinates={territory.coords}
      strokeColor={TERRITORY_COLORS[territory.type].stroke}
      fillColor={TERRITORY_COLORS[territory.type].fill}
      strokeWidth={2}
    />
  );

  const startCapture = () => {
    navigation.navigate("TerritoryDetail", {
      name: "Janwada Area",
      status: "Currently Unclaimed",
      distanceRequired: "Run 1.5 km in this zone",
      reward: "+150 points",
      polygon: createHexagon(
        TARGET_TERRITORY.latitude,
        TARGET_TERRITORY.longitude
      ),
      center: TARGET_TERRITORY,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SafeMapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...BASE_LOCATION,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {territories.map(renderTerritory)}
        <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.marker}>
            <Animated.View style={[styles.pulse, pulseStyle]} />
            <View style={styles.dot} />
          </View>
        </Marker>
      </SafeMapView>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FQ</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="grid" size={14} color={COLORS.card} />
          <Text style={styles.badgeText}>8 Territories</Text>
        </View>
        <View style={styles.points}>
          <Ionicons name="trophy" size={16} color="#FFD166" />
          <Text style={styles.pointsText}>2,450 Points</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.captureBtn}
        activeOpacity={0.9}
        onPress={startCapture}
      >
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          style={styles.btnGradient}
        >
          <Ionicons name="flash" size={18} color={COLORS.card} />
          <Text style={styles.btnText}>Capture Territory</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.freeFlowBtn}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("FreeFlowCapture")}
      >
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.btnGradient}
        >
          <Ionicons name="walk" size={18} color={COLORS.card} />
          <Text style={styles.btnText}>Free-Flow Mode</Text>
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
  header: {
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
    gap: 8,
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
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  marker: {
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
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2E9BFF",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  captureBtn: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },
  freeFlowBtn: {
    position: "absolute",
    left: 16,
    bottom: 24,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  btnText: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontSize: 14,
  },
});

export default MapScreen;
