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
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "AnalyticsDashboard">;

export default function AnalyticsDashboardScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
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
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Analytics
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
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
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricTitle}>
        {title}
      </Text>
    </View>
  );
};

const TuneRow = ({
  title,
  plays
}: {
  title: string;
  plays: string;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{title}</Text>
      <Text style={styles.rowText}>{plays}</Text>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  heroCard: {
    margin: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    padding: 24
  },

  // Muted label on the primary card. `#DDD` reads fine against the light
  // theme's deep-purple `primary` but drops to ~2:1 contrast against the
  // dark theme's lighter-purple `primary` -- branch to a deep purple there
  // (same value used for this exact card-on-primary problem elsewhere,
  // e.g. WalletPaymentsScreen's `updated` style).
  heroLabel: {
    color: theme.dark ? "#4C1D95" : "#DDD"
  },

  // White label on the primary card; kept literal per the white-on-primary
  // exception.
  heroValue: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700"
  },

  // White label on the primary card; kept literal per the white-on-primary
  // exception.
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

  // Decorative light-purple card fill; no matching theme token, so branch
  // to a deep purple in dark mode to keep the text on it legible (same
  // pattern as WalletPaymentsScreen's `actionButton`).
  metricCard: {
    width: "48%",
    backgroundColor: theme.dark ? "#3B2A5A" : "#F5F3FF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text
  },

  metricTitle: {
    color: theme.colors.textMuted,
    marginTop: 4
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  card: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  },

  rowText: {
    color: theme.colors.text
  }
});
