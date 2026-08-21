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

import { useRevenueDashboard } from "../../hooks/payment/useRevenueDashboard";

interface Props {
  navigation: any;
}

export default function RevenueDashboardScreen({
  navigation
}: Props) {
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

const PRIMARY = "#7C3AED";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 36,
    marginBottom: 50
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  summaryCard: {
    margin: 20,
    backgroundColor: "#7C3AED",
    borderRadius: 15,
    padding: 25
  },

  summaryLabel: {
    color: "#DDD",
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
    fontWeight: "700"
  },

  sourceCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  sourceTitle: {
    fontWeight: "600"
  },

  amount: {
    color: PRIMARY,
    fontWeight: "700"
  },

  withdrawButton: {
    backgroundColor: PRIMARY,
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
