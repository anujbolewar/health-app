import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Placeholder = ({ style }) => (
  <View style={[styles.placeholder, style]}>
    <Text style={styles.placeholderText}>
      Map preview unavailable on web. Run on device/emulator.
    </Text>
  </View>
);

const SafeMapView = (props) => <Placeholder style={props.style} />;

export const Marker = () => null;
export const Polygon = () => null;
export const PROVIDER_GOOGLE = undefined;

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
