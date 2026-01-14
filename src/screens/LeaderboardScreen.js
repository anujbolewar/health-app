import React, { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";

const podium = [
  { rank: 2, name: "Amit Patel", points: 3800, medal: "🥈" },
  { rank: 1, name: "Priya Sharma", points: 4200, medal: "🥇" },
  { rank: 3, name: "Neha Singh", points: 3100, medal: "🥉" },
];

const listRanks = [
  { rank: 4, name: "Vikram", points: 2850 },
  { rank: 5, name: "Sneha", points: 2700 },
  { rank: 6, name: "Rohan", points: 2600 },
  { rank: 7, name: "Raj Kumar", points: 2450, you: true },
  { rank: 8, name: "Kavya", points: 2200 },
  { rank: 9, name: "Arjun", points: 2100 },
  { rank: 10, name: "Diya", points: 1950 },
];

const placeholder = "https://placehold.co/120x120";

const LeaderboardScreen = () => {
  const tabs = useMemo(() => ["Daily", "Weekly", "Monthly", "All-Time"], []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const selected = tab === "Weekly";
            return (
              <View
                key={tab}
                style={[styles.tab, selected && styles.tabSelected]}
              >
                <Text
                  style={[styles.tabText, selected && styles.tabTextSelected]}
                >
                  {tab}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankLabel}>Your Rank</Text>
          <Text style={styles.rankNumber}>#7</Text>
          <Text style={styles.rankPoints}>2,450 Points</Text>
        </View>

        <View style={styles.podiumRow}>
          {podium.map((item, idx) => (
            <View
              key={item.rank}
              style={[
                styles.podiumCard,
                idx === 1 && styles.podiumCenter,
                idx !== 1 && styles.podiumSide,
              ]}
            >
              <Text style={styles.medal}>{item.medal}</Text>
              <Image
                source={{ uri: placeholder }}
                style={styles.podiumAvatar}
              />
              <Text style={styles.podiumName}>{item.name}</Text>
              <Text style={styles.podiumPoints}>
                {item.points.toLocaleString()} pts
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.listCard}>
          {listRanks.map((item) => {
            const highlight = item.you;
            return (
              <View
                key={item.rank}
                style={[styles.row, highlight && styles.rowHighlight]}
              >
                <Text
                  style={[styles.rowRank, highlight && styles.rowTextHighlight]}
                >
                  {item.rank}.
                </Text>
                <Image source={{ uri: placeholder }} style={styles.rowAvatar} />
                <View style={styles.rowInfo}>
                  <Text
                    style={[
                      styles.rowName,
                      highlight && styles.rowTextHighlight,
                    ]}
                  >
                    {item.name}
                    {highlight ? "  (YOU)" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.rowPoints,
                      highlight && styles.rowTextHighlight,
                    ]}
                  >
                    {item.points.toLocaleString()} pts
                  </Text>
                </View>
              </View>
            );
          })}
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
    paddingBottom: 24,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.card,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  tabTextSelected: {
    color: COLORS.card,
  },
  rankCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.text,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  rankLabel: {
    color: COLORS.muted,
    marginBottom: 6,
  },
  rankNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  rankPoints: {
    marginTop: 6,
    color: COLORS.primary,
    fontWeight: "800",
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    shadowColor: COLORS.text,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  podiumCenter: {
    transform: [{ translateY: -8 }],
  },
  podiumSide: {
    transform: [{ translateY: 4 }],
  },
  medal: {
    fontSize: 22,
    marginBottom: 6,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  podiumName: {
    fontWeight: "800",
    color: COLORS.text,
  },
  podiumPoints: {
    color: COLORS.muted,
    marginTop: 4,
  },
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: COLORS.text,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },
  rowHighlight: {
    backgroundColor: "#FFF8D6",
  },
  rowRank: {
    width: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 10,
    backgroundColor: "#E5E7EB",
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontWeight: "700",
    color: COLORS.text,
  },
  rowPoints: {
    color: COLORS.muted,
  },
  rowTextHighlight: {
    color: "#A66400",
    fontWeight: "800",
  },
});

export default LeaderboardScreen;
