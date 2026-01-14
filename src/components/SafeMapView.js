import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

let MapViewNative;
let MarkerNative;
let PolygonNative;
let PROVIDER_GOOGLE_NATIVE;

if (Platform.OS !== "web") {
  const RNMaps = require("react-native-maps");
  MapViewNative = RNMaps.default;
  MarkerNative = RNMaps.Marker;
  PolygonNative = RNMaps.Polygon;
  PROVIDER_GOOGLE_NATIVE = RNMaps.PROVIDER_GOOGLE;
}

const Placeholder = ({ style }) => (
  <View style={[style, styles.placeholder]}>
    <Text style={styles.placeholderText}>
      Map preview is unavailable on web. Run on a device or emulator.
    </Text>
  </View>
);

const SafeMapView = ({ children, ...props }) => {
  if (Platform.OS === "web") {
    return <Placeholder style={props.style} />;
  }
  return <MapViewNative {...props}>{children}</MapViewNative>;
};

export const Marker = Platform.OS === "web" ? () => null : MarkerNative;
export const Polygon = Platform.OS === "web" ? () => null : PolygonNative;
export const PROVIDER_GOOGLE = PROVIDER_GOOGLE_NATIVE;

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    fontWeight: "700",
  },
});

export default SafeMapView;
