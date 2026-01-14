/**
 * Free-Flow Territory Capture Screen
 *
 * Replaces hex-grid system with fluid area capture
 * User moves in real-world, app draws trail, detects loops, and captures areas
 */

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SafeMapView, {
  Circle,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from "../components/SafeMapView";
import { COLORS } from "../constants/colors";
import { getTerritoryCaptureService } from "../services/TerritoryCaptureService";

const NAGPUR_COORD = { latitude: 21.1458, longitude: 79.0882 };

const FreeFlowMapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  // State
  const [userLocation, setUserLocation] = useState(NAGPUR_COORD);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activePath, setActivePath] = useState([]);
  const [capturedTerritories, setCapturedTerritories] = useState([]);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalArea: 0,
    captureCount: 0,
  });
  const [loopDetected, setLoopDetected] = useState(false);

  // Animation
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const trailOpacity = useRef(new Animated.Value(1)).current;

  // Service
  const captureService = useRef(null);
  const locationSubscription = useRef(null);

  // Initialize capture service
  useEffect(() => {
    captureService.current = getTerritoryCaptureService({
      minPointDistance: 5,
      gpsAccuracyThreshold: 20,
      minCaptureArea: 100,
      loopClosureThreshold: 15,
      pathUpdateInterval: 2000,
    });

    // Set up callbacks
    captureService.current.onPathUpdate = (data) => {
      setActivePath([...data.path]);
      setStats({ ...data.stats });
    };

    captureService.current.onLoopDetected = (path) => {
      setLoopDetected(true);
      // Animate trail when loop detected
      Animated.sequence([
        Animated.timing(trailOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(trailOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    captureService.current.onCaptureSuccess = (territory) => {
      setLoopDetected(false);
      setCapturedTerritories([
        ...captureService.current.getCapturedTerritories(),
      ]);

      // Show success feedback
      Alert.alert(
        "🎉 Territory Captured!",
        `Area: ${Math.round(territory.area)} m²\nPoints: ${
          territory.simplifiedPointCount
        }`,
        [
          {
            text: "View Details",
            onPress: () => navigation.navigate("CaptureSuccess", { territory }),
          },
          { text: "Continue", style: "cancel" },
        ]
      );
    };

    captureService.current.onCaptureFailure = (result) => {
      setLoopDetected(false);
      Alert.alert("❌ Capture Failed", result.reason);
    };

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [navigation, trailOpacity]);

  // Pulse animation for user location
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Request location permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for territory capture."
        );
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Center map on user
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  // Start GPS tracking when capturing
  useEffect(() => {
    if (isCapturing) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isCapturing]);

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Update every 2 seconds
          distanceInterval: 5, // Or every 5 meters
        },
        (location) => {
          const { latitude, longitude, accuracy } = location.coords;

          setUserLocation({ latitude, longitude });

          // Add point to capture service
          const result = captureService.current.addPoint({
            latitude,
            longitude,
            accuracy,
            timestamp: location.timestamp,
          });

          console.log("GPS point:", result.reason);
        }
      );
    } catch (error) {
      console.error("Location tracking error:", error);
      Alert.alert("Error", "Failed to start location tracking");
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleStartCapture = () => {
    captureService.current.startCapture({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      accuracy: 10,
    });
    setIsCapturing(true);
  };

  const handleStopCapture = () => {
    if (activePath.length < 3) {
      Alert.alert(
        "Too Short",
        "Walk more to create a larger area before stopping."
      );
      return;
    }

    Alert.alert(
      "Complete Capture?",
      "Do you want to complete this territory capture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: () => {
            captureService.current.completeCapture();
            setIsCapturing(false);
            setActivePath([]);
          },
        },
      ]
    );
  };

  const handleCancelCapture = () => {
    Alert.alert("Cancel Capture?", "Your current progress will be lost.", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: () => {
          captureService.current.cancelCapture();
          setIsCapturing(false);
          setActivePath([]);
        },
      },
    ]);
  };

  const handleCenterOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatArea = (sqMeters) => {
    if (sqMeters < 10000) return `${Math.round(sqMeters)} m²`;
    return `${(sqMeters / 10000).toFixed(2)} hectares`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Map */}
      <SafeMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...NAGPUR_COORD,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Captured Territories */}
        {capturedTerritories.map((territory) => (
          <Polygon
            key={territory.id}
            coordinates={territory.polygon}
            fillColor="rgba(76, 175, 80, 0.3)"
            strokeColor="#4CAF50"
            strokeWidth={2}
          />
        ))}

        {/* Active Trail (Polyline) */}
        {isCapturing && activePath.length > 1 && (
          <Animated.View style={{ opacity: trailOpacity }}>
            <Polyline
              coordinates={activePath}
              strokeColor={loopDetected ? "#FF9800" : "#2196F3"}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          </Animated.View>
        )}

        {/* Starting Point Marker */}
        {isCapturing && activePath.length > 0 && (
          <Circle
            center={activePath[0]}
            radius={10}
            fillColor="rgba(76, 175, 80, 0.8)"
            strokeColor="#4CAF50"
            strokeWidth={2}
          />
        )}

        {/* User Location with Pulse */}
        <Circle
          center={userLocation}
          radius={8}
          fillColor="#2196F3"
          strokeColor="#fff"
          strokeWidth={2}
          zIndex={100}
        />

        <Animated.View
          style={{
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
          }}
        >
          <Circle
            center={userLocation}
            radius={20}
            fillColor="rgba(33, 150, 243, 0.3)"
            strokeWidth={0}
          />
        </Animated.View>
      </SafeMapView>

      {/* Top Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>
            {formatDistance(stats.totalDistance)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Territories</Text>
          <Text style={styles.statValue}>{capturedTerritories.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Area</Text>
          <Text style={styles.statValue}>{formatArea(stats.totalArea)}</Text>
        </View>
      </View>

      {/* Center on User Button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={handleCenterOnUser}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isCapturing ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartCapture}
          >
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={28} color="#fff" />
              <Text style={styles.buttonText}>Start Capture</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.captureControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelCapture}
            >
              <Ionicons name="close" size={24} color="#fff" />
              <Text style={styles.smallButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopCapture}
            >
              <LinearGradient
                colors={["#FF5722", "#E64A19"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="stop" size={32} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.statusIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.statusText}>Recording</Text>
            </View>
          </View>
        )}
      </View>

      {/* Loop Detection Indicator */}
      {loopDetected && (
        <View style={styles.loopIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.loopText}>Loop Detected! Completing...</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
  },
  statsBar: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  centerButton: {
    position: "absolute",
    top: 140,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  captureControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#757575",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loopIndicator: {
    position: "absolute",
    top: 200,
    left: 16,
    right: 16,
    backgroundColor: "rgba(76, 175, 80, 0.95)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loopText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default FreeFlowMapScreen;
