import {
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Props {
  navigation: any;
}

const revenueItems = [
  {
    id: "1",
    source: "Music Streaming",
    amount: "₹1,25,000"
  },
  {
    id: "2",
    source: "Rights Sales",
    amount: "₹3,80,000"
  },
  {
    id: "3",
    source: "Voting Revenue",
    amount: "₹85,000"
  },
  {
    id: "4",
    source: "Premium Membership",
    amount: "₹55,000"
  }
];

export default function RevenueDashboardScreen({
  navigation
}: Props) {
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

          <Text style={styles.summaryAmount}>
            ₹6,45,000
          </Text>

          <Text style={styles.growth}>
            ↑ 18% this month
          </Text>
        </View>

        {/* Earnings Cards */}

        <View style={styles.cardRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              ₹2.1L
            </Text>

            <Text style={styles.metricLabel}>
              This Month
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              ₹48K
            </Text>

            <Text style={styles.metricLabel}>
              Pending
            </Text>
          </View>
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
              {item.amount}
            </Text>
          </View>
        ))}

        {/* Withdraw */}

        <TouchableOpacity
          style={styles.withdrawButton}
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

        {/* Reports */}

        <TouchableOpacity
          style={styles.reportButton}
        >
          <Text style={styles.reportText}>
            Download Revenue Report
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

  growth: {
    color: "#FFF",
    marginTop: 10
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20
  },

  metricCard: {
    width: "48%",
    backgroundColor: "#F5F3FF",
    padding: 18,
    borderRadius: 12
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "700"
  },

  metricLabel: {
    marginTop: 4,
    color: "#666"
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
  },

  reportButton: {
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: PRIMARY,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  reportText: {
    color: PRIMARY,
    fontWeight: "700"
  }
});