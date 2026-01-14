import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SafeMapView, {
  Polygon,
  PROVIDER_GOOGLE,
} from "../components/SafeMapView";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

const NAGPUR_COORD = { latitude: 21.1458, longitude: 79.0882 };

const createHexagon = (centerLat, centerLng, radiusMeters = 450) => {
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

const territoryCenters = [
  {
    latitude: NAGPUR_COORD.latitude + 0.0042,
    longitude: NAGPUR_COORD.longitude,
  },
  {
    latitude: NAGPUR_COORD.latitude + 0.0036,
    longitude: NAGPUR_COORD.longitude + 0.0048,
  },
  {
    latitude: NAGPUR_COORD.latitude + 0.0008,
    longitude: NAGPUR_COORD.longitude + 0.0054,
  },
  {
    latitude: NAGPUR_COORD.latitude - 0.0018,
    longitude: NAGPUR_COORD.longitude + 0.0036,
  },
  {
    latitude: NAGPUR_COORD.latitude - 0.0024,
    longitude: NAGPUR_COORD.longitude - 0.0004,
  },
  {
    latitude: NAGPUR_COORD.latitude + 0.0052,
    longitude: NAGPUR_COORD.longitude - 0.0038,
  },
  {
    latitude: NAGPUR_COORD.latitude - 0.0008,
    longitude: NAGPUR_COORD.longitude - 0.0042,
  },
  {
    latitude: NAGPUR_COORD.latitude + 0.0046,
    longitude: NAGPUR_COORD.longitude + 0.007,
  },
];

const stats = [
  { label: "8 Territories", icon: "📍" },
  { label: "12 Day Streak", icon: "🔥" },
  { label: "2,450 Points", icon: "💰" },
  { label: "3 Trees Planted", icon: "🌳" },
];

const activityData = [80, 120, 90, 150, 110, 170, 140];
const activityLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Raj Kumar</Text>
            <TouchableOpacity style={styles.editIcon}>
              <Ionicons name="create-outline" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={14} color={COLORS.card} />
            <Text style={styles.levelText}>Level 8</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <Text style={styles.sectionSubtitle}>Last 7 days (kcal)</Text>
          </View>
          <View style={styles.chartRow}>
            {activityData.map((value, idx) => (
              <View key={activityLabels[idx]} style={styles.barColumn}>
                <LinearGradient
                  colors={["#FFA726", "#FB8C00"]}
                  style={[styles.bar, { height: value }]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                />
                <Text style={styles.barLabel}>{activityLabels[idx]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Territories</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View All Territories</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapPreviewWrapper}>
            <SafeMapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: NAGPUR_COORD.latitude,
                longitude: NAGPUR_COORD.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {territoryCenters.map((center, idx) => (
                <Polygon
                  key={`poly-${idx}`}
                  coordinates={createHexagon(center.latitude, center.longitude)}
                  strokeColor="#FF4D67"
                  fillColor="rgba(255,77,103,0.28)"
                  strokeWidth={2}
                />
              ))}
            </SafeMapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.text,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0A84FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  avatarText: {
    color: COLORS.card,
    fontWeight: "900",
    fontSize: 26,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  editIcon: {
    marginLeft: 10,
  },
  levelBadge: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  levelText: {
    color: COLORS.card,
    fontWeight: "700",
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    marginTop: 8,
    fontWeight: "700",
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    shadowColor: COLORS.text,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: "center",
    width: 32,
  },
  bar: {
    width: 18,
    borderRadius: 8,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.muted,
  },
  mapPreviewWrapper: {
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default ProfileScreen;
