import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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

import { useRevenueDashboard } from "../../hooks/payment/useRevenueDashboard";
import { RootStackParamList } from "../../navigation/types";
import { Theme } from "../../theme/theme";
import { useTheme } from "../../theme/useTheme";

type Props = NativeStackScreenProps<RootStackParamList, "RevenueDashboard">;

export default function RevenueDashboardScreen({
  navigation
}: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { data, isLoading } = useRevenueDashboard();

  const revenueItems = data
    ? [
        { id: "royalties", source: "Royalties", amount: data.royalties },
        { id: "marketplaceSales", source: "Marketplace Sales", amount: data.marketplaceSales },
        { id: "contestWins", source: "Contest Wins", amount: data.contestWins }
      ]
    : [];

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
            Revenue Dashboard
          </Text>

          <View style={{ width: 22 }} />
        </View>

        {/* Revenue Summary */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Total Revenue
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#FFF" style={{ marginTop: 10 }} />
          ) : (
            <Text style={styles.summaryAmount}>
              ₹{(data?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </Text>
          )}
        </View>

        {/* Revenue Sources */}

        <Text style={styles.sectionTitle}>
          Revenue Sources
        </Text>

        {revenueItems.map(item => (
          <View
            key={item.id}
            style={styles.sourceCard}
          >
            <View>
              <Text
                style={styles.sourceTitle}
              >
                {item.source}
              </Text>
            </View>

            <Text style={styles.amount}>
              ₹{item.amount.toLocaleString("en-IN")}
            </Text>
          </View>
        ))}

        {/* Withdraw */}

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => navigation.navigate("WalletPayments")}
        >
          <MaterialCommunityIcons
            name="bank-transfer"
            size={22}
            color="#FFF"
          />

          <Text style={styles.withdrawText}>
            Withdraw Earnings
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text
  },

  summaryCard: {
    margin: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    padding: 25
  },

  // Muted-white label on the primary card; kept as a white-family literal
  // (opacity instead of a separate hex) per the white-on-primary exception.
  summaryLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14
  },

  summaryAmount: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 5
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  sourceCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  sourceTitle: {
    fontWeight: "600",
    color: theme.colors.text
  },

  amount: {
    color: theme.colors.primary,
    fontWeight: "700"
  },

  withdrawButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 25,
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  withdrawText: {
    color: "#FFF",
    fontWeight: "700",
    marginLeft: 10
  }
});
