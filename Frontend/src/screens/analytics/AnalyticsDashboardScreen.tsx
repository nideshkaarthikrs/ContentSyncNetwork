import Feather from "react-native-vector-icons/Feather";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMyProjects } from "../../hooks/project/useMyProjects";
import { useRevenueDashboard } from "../../hooks/payment/useRevenueDashboard";
import { useMyRightsListings } from "../../hooks/rights/useMyRightsListings";
import { useProfile } from "../../hooks/profile/useProfile";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "AnalyticsDashboard">;

export default function AnalyticsDashboardScreen({
  navigation
}: Props) {
  const userId = useAuthStore((state) => state.user?.userId);
  const { data: revenue, isLoading: revenueLoading } = useRevenueDashboard();
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: projects, isLoading: projectsLoading } = useMyProjects();
  const { data: rightsListings, isLoading: rightsLoading } = useMyRightsListings();

  const isLoading = revenueLoading || profileLoading || projectsLoading || rightsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={22}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Analytics
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#7C3AED" />
        ) : (
          <>
            {/* Overview */}

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                Total Revenue
              </Text>

              <Text style={styles.heroValue}>
                ₹{(revenue?.totalRevenue ?? 0).toLocaleString("en-IN")}
              </Text>

              <Text style={styles.heroGrowth}>
                {(revenue?.growthPercent ?? 0) >= 0 ? "+" : ""}
                {revenue?.growthPercent ?? 0}% this month
              </Text>
            </View>

            {/* KPI */}

            <View style={styles.grid}>
              <Metric
                title="Followers"
                value={String(profile?.followers ?? 0)}
              />

              <Metric
                title="Projects"
                value={String(projects?.total ?? 0)}
              />

              <Metric
                title="Rights Listed"
                value={String(rightsListings?.totalRecords ?? 0)}
              />

              <Metric
                title="Rights Sold"
                value={String(rightsListings?.soldCount ?? 0)}
              />
            </View>

            {/* Revenue Sources */}

            <Text style={styles.sectionTitle}>
              Revenue Sources
            </Text>

            <View style={styles.card}>
              <TuneRow
                title="Subscriptions"
                plays={`₹${(revenue?.revenueBreakdown?.subscriptions ?? 0).toLocaleString("en-IN")}`}
              />

              <TuneRow
                title="Marketplace Sales"
                plays={`₹${(revenue?.revenueBreakdown?.marketplaceSales ?? 0).toLocaleString("en-IN")}`}
              />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Metric = ({
  title,
  value
}: {
  title: string;
  value: string;
}) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricValue}>
      {value}
    </Text>

    <Text style={styles.metricTitle}>
      {title}
    </Text>
  </View>
);

const TuneRow = ({
  title,
  plays
}: {
  title: string;
  plays: string;
}) => (
  <View style={styles.row}>
    <Text>{title}</Text>
    <Text>{plays}</Text>
  </View>
);

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  heroCard: {
    margin: 20,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    padding: 24
  },

  heroLabel: {
    color: "#DDD"
  },

  heroValue: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700"
  },

  heroGrowth: {
    color: "#FFF",
    marginTop: 5
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  metricCard: {
    width: "48%",
    backgroundColor: "#F5F3FF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "700"
  },

  metricTitle: {
    color: "#666",
    marginTop: 4
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700"
  },

  card: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  }
});
