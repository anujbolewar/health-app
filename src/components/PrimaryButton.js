import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS, GRADIENTS } from "../constants/theme";

const PrimaryButton = ({ label, onPress, disabled }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={[styles.container, disabled && styles.disabled]}
  >
    <LinearGradient colors={GRADIENTS.action} style={styles.gradient}>
      <Text style={styles.text}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  text: {
    color: COLORS.card,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default PrimaryButton;
