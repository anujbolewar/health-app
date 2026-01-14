import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";

const AVATAR_URL = "https://placehold.co/120x120";

const PODIUM_USERS = [
  { rank: 2, name: "Amit Patel", points: 3800, medal: "🥈" },
  { rank: 1, name: "Priya Sharma", points: 4200, medal: "🥇" },
  { rank: 3, name: "Neha Singh", points: 3100, medal: "🥉" },
];

const LEADERBOARD = [
  { rank: 4, name: "Vikram", points: 2850 },
  { rank: 5, name: "Sneha", points: 2700 },
  { rank: 6, name: "Rohan", points: 2600 },
  { rank: 7, name: "Raj Kumar", points: 2450, isUser: true },
  { rank: 8, name: "Kavya", points: 2200 },
  { rank: 9, name: "Arjun", points: 2100 },
  { rank: 10, name: "Diya", points: 1950 },
];

const TABS = ["Daily", "Weekly", "Monthly", "All-Time"];

const LeaderboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <View
              key={tab}
              style={[styles.tab, tab === "Weekly" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "Weekly" && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.rankCard}>
          <Text style={styles.rankLabel}>Your Rank</Text>
          <Text style={styles.rankValue}>#7</Text>
          <Text style={styles.rankPoints}>2,450 Points</Text>
        </View>

        <View style={styles.podium}>
          {PODIUM_USERS.map((user, idx) => (
            <View
              key={user.rank}
              style={[
                styles.podiumCard,
                idx === 1 ? styles.podiumFirst : styles.podiumOther,
              ]}
            >
              <Text style={styles.medal}>{user.medal}</Text>
              <Image source={{ uri: AVATAR_URL }} style={styles.podiumAvatar} />
              <Text style={styles.podiumName}>{user.name}</Text>
              <Text style={styles.podiumPoints}>
                {user.points.toLocaleString()} pts
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.list}>
          {LEADERBOARD.map((user) => (
            <View
              key={user.rank}
              style={[styles.listItem, user.isUser && styles.listItemActive]}
            >
              <Text style={[styles.listRank, user.isUser && styles.textActive]}>
                {user.rank}.
              </Text>
              <Image source={{ uri: AVATAR_URL }} style={styles.listAvatar} />
              <View style={styles.listInfo}>
                <Text
                  style={[styles.listName, user.isUser && styles.textActive]}
                >
                  {user.name}
                  {user.isUser && "  (YOU)"}
                </Text>
                <Text
                  style={[styles.listPoints, user.isUser && styles.textActive]}
                >
                  {user.points.toLocaleString()} pts
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  tabs: {
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
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  tabTextActive: {
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
  rankValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  rankPoints: {
    marginTop: 6,
    color: COLORS.primary,
    fontWeight: "800",
  },
  podium: {
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
  podiumFirst: {
    transform: [{ translateY: -8 }],
  },
  podiumOther: {
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
    backgroundColor: COLORS.border,
  },
  podiumName: {
    fontWeight: "800",
    color: COLORS.text,
  },
  podiumPoints: {
    color: COLORS.muted,
    marginTop: 4,
  },
  list: {
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },
  listItemActive: {
    backgroundColor: "#FFF8D6",
  },
  listRank: {
    width: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 10,
    backgroundColor: COLORS.border,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontWeight: "700",
    color: COLORS.text,
  },
  listPoints: {
    color: COLORS.muted,
  },
  textActive: {
    color: "#A66400",
    fontWeight: "800",
  },
});

export default LeaderboardScreen;
