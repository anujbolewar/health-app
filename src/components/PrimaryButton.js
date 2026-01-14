import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../constants/colors";

const PrimaryButton = ({ label, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.touchable}
  >
    <LinearGradient colors={GRADIENTS.action} style={styles.gradient}>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  label: {
    color: COLORS.card,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});

export default PrimaryButton;
