import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
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
import { COLORS, GRADIENTS } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TerritoryDetailModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const slide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const {
    name = "Janwada Area",
    status = "Currently Unclaimed",
    distanceRequired = "Run 1.5 km in this zone",
    reward = "+150 points",
    polygon = [],
    center,
  } = route.params || {};

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [slide]);

  const startCapture = () => {
    navigation.replace("ActivityTracking", { name, polygon, center });
  };

  return (
    <SafeAreaView style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={navigation.goBack} />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slide }] }]}
      >
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.subtitle}>{status}</Text>
          </View>
          <View style={styles.rewardPill}>
            <Ionicons name="sparkles" size={16} color={COLORS.card} />
            <Text style={styles.rewardText}>{reward}</Text>
          </View>
        </View>

        {center && (
          <View style={styles.mapPreviewWrapper}>
            <SafeMapView
              style={styles.mapPreview}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {polygon.length > 0 && (
                <Polygon
                  coordinates={polygon}
                  strokeColor="#3DDC84"
                  fillColor="rgba(61,220,132,0.2)"
                  strokeWidth={2}
                />
              )}
            </SafeMapView>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="walk" size={18} color={COLORS.text} />
          <Text style={styles.metaText}>{distanceRequired}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="medal" size={18} color={COLORS.text} />
          <Text style={styles.metaText}>Mental Points reward: {reward}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={startCapture}
          style={styles.primaryButton}
        >
          <LinearGradient
            colors={GRADIENTS.action}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryLabel}>START CAPTURE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={navigation.goBack}
        >
          <Text style={styles.secondaryLabel}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },
  handle: {
    alignSelf: "center",
    width: 46,
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 14,
  },
  rewardPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  rewardText: {
    color: COLORS.card,
    marginLeft: 6,
    fontWeight: "700",
  },
  mapPreviewWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    height: 220,
  },
  mapPreview: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  metaText: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 12,
  },
  primaryGradient: {
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryLabel: {
    color: COLORS.card,
    fontWeight: "800",
    letterSpacing: 0.4,
    fontSize: 15,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryLabel: {
    color: COLORS.muted,
    fontWeight: "700",
  },
});

export default TerritoryDetailModal;
